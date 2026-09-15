import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TableAction, HeaderAction } from '../../../shared/components/dynamic-tables/dynamic-tables.component';
import { AlertsService } from '../alerts.service';
import { ScreeningSummary, ScreeningStats, Severity } from '../../../data/types/screening-results.model';

@Component({
  selector: 'app-alerts',
  standalone: false,
  templateUrl: './alerts.html',
  styleUrl: './alerts.scss',
})
export class Alerts implements OnInit, OnDestroy {
  alerts: ScreeningSummary[] = [];
  stats: ScreeningStats | null = null;
  isLoading = false;
  selectedSeverity: Severity | undefined = undefined;

  totalElements = 0;
  pageIndex = 0;
  pageSize = 20;

  severityOptions: { label: string; value: Severity | undefined }[] = [
    { label: 'All',      value: undefined },
    { label: 'Low',      value: 'LOW' },
    { label: 'Medium',   value: 'MEDIUM' },
    { label: 'High',     value: 'HIGH' },
    { label: 'Critical', value: 'CRITICAL' },
  ];

  columns = [
    { label: '#',              field: 'index' },
    { label: 'Transaction ID', field: 'transactionId' },
    { label: 'Score',          field: 'score' },
    { label: 'Severity',       field: 'severity',  type: 'badge' },
    { label: 'Alert',          field: 'alert',     type: 'badge' },
    { label: 'Threshold',      field: 'alertThreshold' },
    { label: 'Screened At',    field: 'screenedAt', type: 'date' },
  ];

  actions: TableAction<ScreeningSummary>[] = [
    {
      label: 'View',
      icon: 'visibility',
      onClick: (row) => this.viewDetail(row),
    },
  ];

  headerActions: HeaderAction[] = [
    {
      icon: 'refresh',
      tooltip: 'Refresh',
      onClick: () => this.loadAlerts(),
    },
  ];

  private subs: Subscription[] = [];

  constructor(
    private alertsService: AlertsService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadAlerts();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadAlerts(): void {
    this.isLoading = true;
    const sub = this.alertsService
      .getAlerts(this.pageIndex, this.pageSize, this.selectedSeverity)
      .subscribe({
        next: (page) => {
          this.alerts = page.content;
          this.totalElements = page.totalElements;
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; },
      });
    this.subs.push(sub);
  }

  loadStats(): void {
    const sub = this.alertsService.getStats().subscribe({
      next: (stats) => { this.stats = stats; },
    });
    this.subs.push(sub);
  }

  onSeverityChange(severity: Severity | undefined): void {
    this.selectedSeverity = severity;
    this.pageIndex = 0;
    this.loadAlerts();
  }

  viewDetail(row: ScreeningSummary): void {
    this.router.navigate(['/admin/assessments/alerts/view', row.transactionId]);
  }
}
