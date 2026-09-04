import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { TableAction, HeaderAction } from '../../../shared/components/dynamic-tables/dynamic-tables.component';
import { SanctionsService, SourceConfigResponse } from '../sanctions.service';
import { LoadingService } from '../../../core/service/loading.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { NotificationToastService } from '../../../data/services/notification-toast.service';

@Component({
  selector: 'app-source-configuration',
  standalone: false,
  templateUrl: './source-configuration.component.html',
  styleUrl: './source-configuration.component.scss',
})
export class SourceConfigurationComponent implements OnInit, OnDestroy {
  sources: SourceConfigResponse[] = [];
  totalElements = 0;
  pageIndex = 0;
  pageSize = 10;

  // Expose loading$ for the template (initialized in ngOnInit)
  loading$!: Observable<boolean>;

  columns = [
    { label: '#', field: 'index' },
    { label: 'Display Name', field: 'displayName' },
    { label: 'Source', field: 'source' },
    { label: 'Acquisition Mode', field: 'acquisitionModeDisplay' },
    { label: 'Entries', field: 'entryCountDisplay' },
    { label: 'Sync Status', field: 'lastSyncStatus', type: 'badge' },
    { label: 'Enabled', field: 'enabled', type: 'badge' },
    { label: 'Last Sync', field: 'lastSyncAt', type: 'date' },
  ];

  actions: TableAction<SourceConfigResponse>[] = [
    {
      label: 'View',
      icon: 'visibility',
      onClick: (row: SourceConfigResponse) => this.viewSource(row),
    },
    {
      label: 'Edit',
      icon: 'edit',
      onClick: (row: SourceConfigResponse) => this.editSource(row),
    },
    {
      label: 'Sync History',
      icon: 'history',
      onClick: (row: SourceConfigResponse) => this.viewSyncHistory(row),
    },
    {
      label: 'Test Connection',
      icon: 'wifi_tethering',
      show: (row) => row.acquisitionMode !== 'MANUAL_UPLOAD',
      onClick: (row: SourceConfigResponse) => this.testConnection(row),
    },
    {
      label: 'Enable',
      icon: 'toggle_on',
      show: (row) => !row.enabled,
      onClick: (row: SourceConfigResponse) => this.toggleEnabled(row),
    },
    {
      label: 'Disable',
      icon: 'toggle_off',
      show: (row) => row.enabled === true,
      onClick: (row: SourceConfigResponse) => this.toggleEnabled(row),
    },
  ];

  headerActions: HeaderAction[] = [
    {
      icon: 'refresh',
      tooltip: 'Refresh',
      onClick: () => this.loadSources(),
    },
  ];

  private subs: Subscription[] = [];

  constructor(
    private sanctionsService: SanctionsService,
    private snackbar: NotificationToastService,
    private router: Router,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    this.loading$ = this.loadingService.loading$;
    this.loadSources();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  loadSources(): void {
    this.loadingService.show();
    const sub = this.sanctionsService.getSourceConfigs({
      page: this.pageIndex,
      size: this.pageSize,
    }).subscribe({
      next: (response) => {
        this.sources = (response?.content || []).map(s => ({
          ...s,
          acquisitionModeDisplay: this.getAcquisitionModeLabel(s.acquisitionMode),
          entryCountDisplay: s.entryCount?.toLocaleString() || '0',
        }));
        this.totalElements = response?.totalElements || 0;
        this.loadingService.hide();
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.loadingService.hide();
        this.cdr.detectChanges();
        this.snackbar.alertError(err?.error?.message || 'Failed to load sources');
      },
    });
    this.subs.push(sub);
  }

  onAdd(): void {
    this.router.navigate(['/admin/sanctions/sources/add']);
  }

  viewSource(source: SourceConfigResponse): void {
    this.router.navigate(['/admin/sanctions/sources/view', source.source]);
  }

  editSource(source: SourceConfigResponse): void {
    this.router.navigate(['/admin/sanctions/sources/edit', source.source]);
  }

  viewSyncHistory(source: SourceConfigResponse): void {
    this.router.navigate(['/admin/sanctions/sources/history', source.source]);
  }

  testConnection(source: SourceConfigResponse): void {
    const sub = this.sanctionsService.testSourceConnection(source.source).subscribe({
      next: (result) => {
        if (result === 'NOT_IMPLEMENTED') {
          this.snackbar.alertSuccess('Connection test not implemented for this source type');
        } else {
          this.snackbar.alertSuccess(result || 'Connection test successful');
        }
      },
      error: (err: any) => {
        this.snackbar.alertError(err?.error?.message || 'Connection test failed');
      },
    });
    this.subs.push(sub);
  }

  toggleEnabled(source: SourceConfigResponse): void {
    const isEnabled = source.enabled;
    const action = isEnabled ? 'disable' : 'enable';
    
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '460px',
      maxWidth: 'calc(100vw - 32px)',
      data: {
        title: `${isEnabled ? 'Disable' : 'Enable'} Source`,
        message: `Are you sure you want to ${action} "${source.displayName}"?${isEnabled ? ' This will stop syncing and screening against this list.' : ''}`,
        confirmText: isEnabled ? 'Disable' : 'Enable',
        cancelText: 'Cancel',
      },
    });

    const sub = dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      if (isEnabled) {
        const disableSub = this.sanctionsService.disableSource(source.source).subscribe({
          next: () => {
            this.snackbar.alertSuccess('Source disabled successfully');
            this.loadSources();
          },
          error: (err: any) => {
            this.snackbar.alertError(err?.error?.message || 'Failed to disable source');
          },
        });
        this.subs.push(disableSub);
      } else {
        const enableSub = this.sanctionsService.enableSource(source.source).subscribe({
          next: () => {
            this.snackbar.alertSuccess('Source enabled successfully');
            this.loadSources();
          },
          error: (err: any) => {
            this.snackbar.alertError(err?.error?.message || 'Failed to enable source');
          },
        });
        this.subs.push(enableSub);
      }
    });
    this.subs.push(sub);
  }

  onPaginationChange(event: { pageNumber: number; pageSize: number }): void {
    this.pageIndex = event.pageNumber;
    this.pageSize = event.pageSize;
    this.loadSources();
  }

  private getAcquisitionModeLabel(mode: string): string {
    switch (mode) {
      case 'API': return 'API';
      case 'FILE_DOWNLOAD': return 'File Download';
      case 'SFTP': return 'SFTP';
      case 'DATABASE': return 'Database';
      case 'MANUAL_UPLOAD': return 'Manual Upload';
      default: return mode || '-';
    }
  }
}
