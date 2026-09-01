// view-sanctions-entries-component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SnackbarService } from '../../../../shared/services/snackbar.service';
import { SanctionEntryResponse, SanctionsService } from '../../sanctions.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-view-sanctions-entries-component',
  standalone: false,
  templateUrl: './view-sanctions-entries-component.html',
  styleUrl: './view-sanctions-entries-component.scss',
})
export class ViewSanctionsEntriesComponent implements OnInit, OnDestroy {

  entry: SanctionEntryResponse | null = null;
  isLoading = false;
  entryId: number | null = null;

  private subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: SanctionsService,
    private snack: SnackbarService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/admin/sanctions/entries']);
      return;
    }
    this.entryId = Number(idParam);
    if (isNaN(this.entryId)) {
      this.router.navigate(['/admin/sanctions/entries']);
      return;
    }
    this.loadEntry(this.entryId);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  private loadEntry(id: number): void {
    this.isLoading = true;
    const s = this.service.getEntry(id).subscribe({
      next: (entry: SanctionEntryResponse) => {
        this.entry = entry;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.snack.alertError(err?.error?.message || 'Failed to load entry');
        this.router.navigate(['/admin/sanctions/entries']);
      },
    });
    this.subs.push(s);
  }

  editEntry(): void {
    if (this.entry?.id) {
      this.router.navigate(['/admin/sanctions/entries/edit', this.entry.id]);
    }
  }

  deactivateEntry(): void {
    if (!this.entry) return;

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '460px',
      maxWidth: 'calc(100vw - 32px)',
      data: {
        title: 'Deactivate Sanction Entry',
        message: `Are you sure you want to deactivate the sanction entry "${this.entry.fullName}"? The entry will no longer be used in screening.`,
        confirmText: 'Deactivate',
        cancelText: 'Cancel',
      },
    });

    const sub = dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      const s = this.service.deactivateEntry(this.entry!.id).subscribe({
        next: () => {
          this.snack.alertSuccess('Entry deactivated successfully');
          this.loadEntry(this.entry!.id);
        },
        error: (err) => {
          this.snack.alertError(err?.error?.message || 'Failed to deactivate entry');
        },
      });
      this.subs.push(s);
    });
    this.subs.push(sub);
  }

  deleteEntry(): void {
    if (!this.entry) return;

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '460px',
      maxWidth: 'calc(100vw - 32px)',
      data: {
        title: 'Delete Sanction Entry',
        message: `Are you sure you want to delete the sanction entry "${this.entry.fullName}"? This action cannot be undone.`,
        confirmText: 'Delete Entry',
        cancelText: 'Cancel',
      },
    });

    const sub = dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      const s = this.service.deleteEntry(this.entry!.id).subscribe({
        next: () => {
          this.snack.alertSuccess('Entry deleted successfully');
          this.router.navigate(['/admin/sanctions/entries']);
        },
        error: (err) => {
          this.snack.alertError(err?.error?.message || 'Failed to delete entry');
        },
      });
      this.subs.push(s);
    });
    this.subs.push(sub);
  }

  back(): void {
    this.router.navigate(['/admin/sanctions/entries']);
  }
}