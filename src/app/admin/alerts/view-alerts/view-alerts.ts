import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AlertsService } from '../alerts.service';
import { ScreeningDetail, SEVERITY_BADGE } from '../../../data/types/screening-results.model';

@Component({
  selector: 'app-view-alerts',
  standalone: false,
  templateUrl: './view-alerts.html',
  styleUrl: './view-alerts.scss',
})
export class ViewAlerts implements OnInit, OnDestroy {
  detail: ScreeningDetail | null = null;
  isLoading = false;
  transactionId = '';
  severityBadge = SEVERITY_BADGE;

  private subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private alertsService: AlertsService,
  ) {}

  ngOnInit(): void {
    this.transactionId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.transactionId) {
      this.loadDetail();
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadDetail(): void {
    this.isLoading = true;
    const sub = this.alertsService.getDetail(this.transactionId).subscribe({
      next: (detail) => {
        this.detail = detail;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
    this.subs.push(sub);
  }
}
