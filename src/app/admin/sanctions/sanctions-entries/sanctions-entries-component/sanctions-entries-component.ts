import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DeleteConfirmationDialog } from '../../../../shared/components/delete-confirmation-dialog/delete-confirmation-dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TableAction, HeaderAction, CustomFilterOption } from '../../../../shared/components/dynamic-tables/dynamic-tables.component';
import { SnackbarService } from '../../../../shared/services/snackbar.service';
import { SanctionEntryResponse, SanctionsService, PageResponse, SanctionListSourceInfo } from '../../sanctions.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-sanctions-entries-components',
  standalone: false,
  templateUrl: './sanctions-entries-component.html',
  styleUrl: './sanctions-entries-component.scss',
})
export class SanctionsEntriesComponent implements OnInit, OnDestroy {
  entries: SanctionEntryResponse[] = [];
  sources: SanctionListSourceInfo[] = [];
  selectedSource: string | null = null;
  isLoading = false;
  totalElements = 0;
  currentPage = 0;
  pageSize = 10;

  // Source filter options for dynamic table
  sourceFilterOptions: CustomFilterOption[] = [];
  selectedSourceFilter: string | null = null;

  columns = [
    { label: '#',            field: 'index'                        },
    { label: 'Full Name',    field: 'fullName'                     },
    { label: 'Source',       field: 'sourceDisplayName'            },
    { label: 'Entity Type',  field: 'entityType',    type: 'badge' },
    { label: 'Listed Date',  field: 'listedDate',    type: 'date'  },
  ];

  actions: TableAction<SanctionEntryResponse>[] = [
    {
      label: 'View',
      icon: 'visibility',
      onClick: (row: SanctionEntryResponse) => this.viewEntry(row),
    },
    {
      label: 'Edit',
      icon: 'edit',
      onClick: (row: SanctionEntryResponse) => this.editEntry(row),
    },
    {
      label: 'Deactivate',
      icon: 'block',
      onClick: (row: SanctionEntryResponse) => this.deactivateEntry(row),
    },
    {
      label: 'Delete',
      icon: 'delete',
      onClick: (row: SanctionEntryResponse) => this.deleteEntry(row),
    },
  ];

  headerActions: HeaderAction[] = [
    {
      icon: 'refresh',
      tooltip: 'Refresh',
      onClick: () => this.loadEntries(),
    },
    {
      icon: 'cloud_sync',
      tooltip: 'Sync Lists',
      onClick: () => this.syncLists(),
    },
  ];

  private subs: Subscription[] = [];

  constructor(
    private sanctionsService: SanctionsService,
    private snackbar: SnackbarService,
    private router: Router,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadSources();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadSources(): void {
    const sub = this.sanctionsService.getSources().subscribe({
      next: (sources) => {
        this.sources = sources;
        
        // Build source filter options for dynamic table
        this.sourceFilterOptions = sources.map(source => ({
          value: source.source,
          label: source.displayName
        }));
        
        // Add "All Sources" option
        this.sourceFilterOptions.unshift({
          value: null,
          label: 'All Sources'
        });

        if (sources.length > 0) {
          this.selectedSource = null; // Start with "All Sources"
          this.loadEntries();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.snackbar.alertError(err?.error?.message || 'Failed to load sources');
      },
    });
    this.subs.push(sub);
  }

  onSourceFilterChange(sourceValue: string | null): void {
    this.selectedSource = sourceValue;
    this.currentPage = 0;
    this.loadEntries();
  }

  loadEntries(): void {
    this.isLoading = true;
    
    // If no source selected, load all entries (or use first source as fallback)
    const sourceToLoad = this.selectedSource || (this.sources.length > 0 ? this.sources[0].source : '');
    
    if (!sourceToLoad) {
      this.isLoading = false;
      return;
    }

    const sub = this.sanctionsService.getEntries(sourceToLoad, this.currentPage, this.pageSize).subscribe({
      next: (page: PageResponse<SanctionEntryResponse>) => {
        this.entries = page.content || [];
        this.totalElements = page.totalElements || 0;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.snackbar.alertError(err?.error?.message || 'Failed to load entries');
      },
    });
    this.subs.push(sub);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadEntries();
  }

  onAdd(): void {
    this.router.navigate(['/admin/sanctions/entries/add']);
  }

  viewEntry(entry: SanctionEntryResponse): void {
    this.router.navigate(['/admin/sanctions/entries/view', entry.id]);
  }

  editEntry(entry: SanctionEntryResponse): void {
    this.router.navigate(['/admin/sanctions/entries/edit', entry.id]);
  }

  deleteEntry(entry: SanctionEntryResponse): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialog, {
      width: '460px',
      maxWidth: 'calc(100vw - 32px)',
      data: {
        title: 'Delete Sanction Entry',
        message: `Are you sure you want to delete the sanction entry "${entry.fullName}"? This action cannot be undone.`,
        confirmText: 'Delete Entry',
        cancelText: 'Cancel',
      },
    });

    const sub = dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      const deleteSub = this.sanctionsService.deleteEntry(entry.id).subscribe({
        next: () => {
          this.snackbar.alertSuccess('Entry deleted successfully');
          this.loadEntries();
        },
        error: (err: any) => {
          this.snackbar.alertError(err?.error?.message || 'Failed to delete entry');
        },
      });
      this.subs.push(deleteSub);
    });
    this.subs.push(sub);
  }

  deactivateEntry(entry: SanctionEntryResponse): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '460px',
      maxWidth: 'calc(100vw - 32px)',
      data: {
        title: 'Deactivate Sanction Entry',
        message: `Are you sure you want to deactivate the sanction entry "${entry.fullName}"? The entry will no longer be used in screening.`,
        confirmText: 'Deactivate',
        cancelText: 'Cancel',
      },
    });

    const sub = dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      const deactivateSub = this.sanctionsService.deactivateEntry(entry.id).subscribe({
        next: () => {
          this.snackbar.alertSuccess('Entry deactivated successfully');
          this.loadEntries();
        },
        error: (err: any) => {
          this.snackbar.alertError(err?.error?.message || 'Failed to deactivate entry');
        },
      });
      this.subs.push(deactivateSub);
    });
    this.subs.push(sub);
  }

  syncLists(): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '460px',
      maxWidth: 'calc(100vw - 32px)',
      data: {
        title: 'Sync All Sanction Lists',
        message: 'This will sync all enabled sanction lists from their sources. This may take a few minutes. Do you want to continue?',
        confirmText: 'Sync All',
        cancelText: 'Cancel',
      },
    });

    const sub = dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      const syncSub = this.sanctionsService.syncAll().subscribe({
        next: (msg: string) => {
          this.snackbar.alertSuccess(msg || 'Sync started successfully');
        },
        error: (err: any) => {
          this.snackbar.alertError(err?.error?.message || 'Failed to sync lists');
        },
      });
      this.subs.push(syncSub);
    });
    this.subs.push(sub);
  }
}