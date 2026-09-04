import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SanctionEntryResponse, SanctionsService } from '../../sanctions.service';
import { MatDialog } from '@angular/material/dialog';
import { NotificationToastService } from '../../../../data/services/notification-toast.service';

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
    private snack: NotificationToastService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
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
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
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

  back(): void {
    this.router.navigate(['/admin/sanctions/entries']);
  }
}