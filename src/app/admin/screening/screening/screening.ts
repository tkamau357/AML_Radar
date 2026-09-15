import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, finalize } from 'rxjs';
import { TableAction, HeaderAction } from '../../../shared/components/dynamic-tables/dynamic-tables.component';
import { ScreeningService, OfflineScreenResult } from '../screening.service';
import { AlertsService } from '../../alerts/alerts.service';
import { ScreeningSummary, ScreeningStats } from '../../../data/types/screening-results.model';
import { NotificationToastService } from '../../../data/services/notification-toast.service';

@Component({
  selector: 'app-screening',
  standalone: false,
  templateUrl: './screening.html',
  styleUrl: './screening.scss',
})
export class Screening implements OnInit, OnDestroy {

  // ── Stats ────────────────────────────────────────────────────────────────
  stats: ScreeningStats | null = null;

  // ── Filter bar ───────────────────────────────────────────────────────────
  selectedDate: string = new Date().toISOString().slice(0, 10);
  today: string = new Date().toISOString().slice(0, 10);
  isInitiating = false;
  lastResult: OfflineScreenResult | null = null;

  // ── Tabs ─────────────────────────────────────────────────────────────────
  activeTab: 'all' | 'alerts' = 'all';

  // ── Table ────────────────────────────────────────────────────────────────
  rows: ScreeningSummary[] = [];
  isLoading = false;
  totalElements = 0;
  pageIndex = 0;
  pageSize = 20;

  columns = [
    { label: '#',             field: 'index' },
    { label: 'Transaction ID', field: 'transactionId' },
    { label: 'Score',          field: 'score' },
    { label: 'Severity',       field: 'severity',  type: 'badge' },
    { label: 'Alert',          field: 'alert',     type: 'badge' },
    { label: 'Threshold',      field: 'alertThreshold' },
    { label: 'Screened At',    field: 'screenedAt', type: 'date' },
  ];

  actions: TableAction<ScreeningSummary>[] = [
    {
      label: 'View Scores',
      icon: 'analytics',
      onClick: (row) => this.viewDetail(row),
    },
  ];

  headerActions: HeaderAction[] = [
    {
      icon: 'refresh',
      tooltip: 'Refresh',
      onClick: () => this.loadData(),
    },
  ];

  private subs: Subscription[] = [];

  constructor(
    private screeningService: ScreeningService,
    private alertsService: AlertsService,
    private snackbar: NotificationToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  // ── Initiate screening ───────────────────────────────────────────────────

  initiateScreening(): void {
    if (!this.selectedDate || this.isInitiating) return;
    this.isInitiating = true;
    this.lastResult = null;
    const sub = this.screeningService
      .offlineScreen(this.selectedDate)
      .pipe(finalize(() => { this.isInitiating = false; this.cdr.detectChanges(); }))
      .subscribe({
        next: (result) => {
          this.lastResult = result;
          this.snackbar.alertSuccess(
            `Screening complete — ${result.processed} transactions processed, ${result.alerts} alerts raised.`
          );
          this.loadStats();
          this.loadData();
        },
        error: (err) => {
          this.snackbar.alertError(err?.error?.message || 'Screening failed. Please try again.');
        },
      });
    this.subs.push(sub);
  }

  // ── Tab switching ────────────────────────────────────────────────────────

  switchTab(tab: 'all' | 'alerts'): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.pageIndex = 0;
    this.loadData();
  }

  // ── Data loading ─────────────────────────────────────────────────────────

  loadData(): void {
    this.isLoading = true;
    const request$ = this.activeTab === 'alerts'
      ? this.alertsService.getAlerts(this.pageIndex, this.pageSize)
      : this.alertsService.getAll(this.pageIndex, this.pageSize);

    const sub = request$.subscribe({
      next: (page) => {
        this.rows = page.content;
        this.totalElements = page.totalElements;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoading = false; },
    });
    this.subs.push(sub);
  }

  loadStats(): void {
    const sub = this.alertsService.getStats().subscribe({
      next: (s) => { this.stats = s; this.cdr.detectChanges(); },
    });
    this.subs.push(sub);
  }

  viewDetail(row: ScreeningSummary): void {
    this.router.navigate(['/admin/assessments/alerts/view', row.transactionId]);
  }
}
