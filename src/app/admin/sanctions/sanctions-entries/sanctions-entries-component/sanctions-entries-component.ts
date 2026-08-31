import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TableAction, HeaderAction } from '../../../../shared/components/dynamic-tables/dynamic-tables.component';
import { SnackbarService } from '../../../../shared/services/snackbar.service';
import { SanctionEntryResponse, SanctionsService } from '../../sanctions.service';

@Component({
  selector: 'app-sanctions-entries-components',
  standalone: false,
  templateUrl: './sanctions-entries-component.html',
  styleUrl: './sanctions-entries-component.scss',
})
export class SanctionsEntriesComponent implements OnInit, OnDestroy {
  entries: SanctionEntryResponse[] = [];
  isLoading = false;

  columns = [
    { label: '#',            field: 'index'                        },
    { label: 'Full Name',    field: 'fullName'                     },
    { label: 'Source',       field: 'sourceDisplayName'            },
    { label: 'Entity Type',  field: 'entityType',    type: 'badge' },
    { label: 'Status',       field: 'active',        type: 'badge' },
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
  ) {}

  ngOnInit(): void {
    this.loadEntries();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadEntries(): void {
    this.isLoading = true;
    // Load default source or first available
    const sub = this.sanctionsService.getEntries('OFAC_SDN', 0, 100).subscribe({
      next: (page: any) => {
        this.entries = page.content || [];
        this.isLoading = false;
      },
      error: (err: any) => {
        this.isLoading = false;
        this.snackbar.alertError(err?.error?.message || 'Failed to load entries');
      },
    });
    this.subs.push(sub);
  }

  onAdd(): void {
    this.router.navigate(['/admin/sanctions/add']);
  }

  viewEntry(entry: SanctionEntryResponse): void {
    this.router.navigate(['/admin/sanctions/view', entry.id]);
  }

  editEntry(entry: SanctionEntryResponse): void {
    this.router.navigate(['/admin/sanctions/edit', entry.id]);
  }

  deleteEntry(entry: SanctionEntryResponse): void {
    if (!confirm(`Delete sanction entry "${entry.fullName}"? This cannot be undone.`)) return;

    const sub = this.sanctionsService.deleteEntry(entry.id).subscribe({
      next: () => {
        this.snackbar.alertSuccess('Entry deleted successfully');
        this.loadEntries();
      },
      error: (err: any) => {
        this.snackbar.alertError(err?.error?.message || 'Failed to delete entry');
      },
    });
    this.subs.push(sub);
  }

  deactivateEntry(entry: SanctionEntryResponse): void {
    if (!confirm(`Deactivate sanction entry "${entry.fullName}"?`)) return;

    const sub = this.sanctionsService.deactivateEntry(entry.id).subscribe({
      next: () => {
        this.snackbar.alertSuccess('Entry deactivated successfully');
        this.loadEntries();
      },
      error: (err: any) => {
        this.snackbar.alertError(err?.error?.message || 'Failed to deactivate entry');
      },
    });
    this.subs.push(sub);
  }

  syncLists(): void {
    const sub = this.sanctionsService.syncAll().subscribe({
      next: (msg: string) => {
        this.snackbar.alertSuccess(msg || 'Sync started successfully');
      },
      error: (err: any) => {
        this.snackbar.alertError(err?.error?.message || 'Failed to sync lists');
      },
    });
    this.subs.push(sub);
  }
}