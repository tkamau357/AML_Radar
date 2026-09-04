import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { RulesService, RawFeatureDef, EngineConfigRules } from '../rules.service';

@Component({
  selector: 'app-view-rules',
  standalone: false,
  templateUrl: './view-rules.html',
  styleUrl: './view-rules.scss',
})
export class ViewRules implements OnInit, OnDestroy {
  featureDef: RawFeatureDef | null = null;
  engineConfig: EngineConfigRules | null = null;
  featureId: string | null = null;
  isLoading = false;

  private subs: Subscription[] = [];

  constructor(
    private rulesService: RulesService,
    private route: ActivatedRoute,
    private router: Router,
    private snackbar: SnackbarService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.featureId = this.route.snapshot.paramMap.get('id');
    if (this.featureId) {
      this.loadData(this.featureId);
    } else {
      this.snackbar.alertError('No feature ID provided');
      this.router.navigate(['/admin/assessments/rules']);
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadData(id: string): void {
    this.isLoading = true;
    
    // Load catalog to get feature definition
    this.subs.push(
      this.rulesService.getCatalog().subscribe({
        next: (response) => {
          const catalog = response.result || [];
          this.featureDef = catalog.find(f => f.id === id) || null;
          if (!this.featureDef) {
            this.snackbar.alertError('Feature not found');
            this.router.navigate(['/admin/assessments/rules']);
          }
          this.checkLoadingComplete();
        },
        error: (err) => {
          this.snackbar.alertError('Failed to load catalog');
          this.isLoading = false;
        },
      })
    );

    // Load engine config for current values
    this.subs.push(
      this.rulesService.getConfig().subscribe({
        next: (response) => {
          this.engineConfig = response.result;
          this.checkLoadingComplete();
        },
        error: (err) => {
          this.snackbar.alertError('Failed to load config');
          this.isLoading = false;
        },
      })
    );
  }

  checkLoadingComplete(): void {
    if (this.featureDef && this.engineConfig) {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  getCurrentConfig(): { enabled: boolean; score: number; params: Record<string, any> } {
    if (!this.engineConfig || !this.featureId) {
      return { enabled: false, score: 0, params: {} };
    }
    
    return this.engineConfig.features?.[this.featureId] || {
      enabled: this.featureDef?.enabledByDefault ?? false,
      score: this.featureDef?.defaultScore ?? 0,
      params: this.featureDef?.defaultParams || {},
    };
  }

  editFeature(): void {
    if (this.featureId) {
      this.router.navigate(['/admin/assessments/rules/edit', this.featureId]);
    }
  }

  backToList(): void {
    this.router.navigate(['/admin/assessments/rules']);
  }

  formatParamValue(key: string, value: any): string {
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  }

   // Add to add-rules.ts
  getEnumOptions(param: any): string[] {
    switch (param.key) {
      case 'operator':
        return ['GTE', 'GT'];
      case 'groupBy':
        return ['customerId', 'accountId', 'deviceId'];
      case 'mode':
        return ['NON_BASE', 'FLAGGED_LIST'];
      case 'onMissing':
        return ['SKIP', 'FLAG'];
      default:
        return [];
    }
  }

  getStringListOptions(param: any): string[] {
    switch (param.key) {
      case 'riskProfiles':
        return ['DIGITAL', 'CARD_PRESENT', 'IN_PERSON', 'LOW_BANDWIDTH_DIGITAL'];
      case 'applyToTypes':
        return ['CASH_DEPOSIT', 'CASH_WITHDRAWAL', 'TRANSFER', 'PAYMENT', 'MOBILE_MONEY', 'CARD_TRANSACTION', 'LOAN_DISBURSEMENT', 'LOAN_REPAYMENT'];
      case 'applyToChannels':
        return ['MOBILE_BANKING', 'INTERNET_BANKING', 'BRANCH', 'ATM', 'POS', 'USSD', 'AGENT_BANKING', 'MOBILE_MONEY', 'API'];
      default:
        return [];
    }
  }

  getScoreClass(score: number): string {
    if (score >= 90) return 'bg-danger';
    if (score >= 75) return 'bg-warning';
    if (score >= 60) return 'bg-info';
    if (score >= 30) return 'bg-primary';
    return 'bg-secondary';
  }

  getFeatureIcon(featureId?: string): string {
    const iconMap: Record<string, string> = {
      'AMOUNT_ABSOLUTE': 'payments',
      'AMOUNT_JUST_BELOW': 'trending_down',
      'AMOUNT_ROUND': 'circle',
      'VELOCITY_COUNT': 'speed',
      'VELOCITY_VOLUME': 'swap_vert',
      'STRUCTURING': 'call_split',
      'OFF_HOURS': 'schedule',
      'WEEKEND': 'event_available',
      'CHANNEL_RISK': 'router',
      'TYPE_RISK': 'category',
      'CURRENCY_UNUSUAL': 'currency_exchange',
      'NARRATION_KEYWORDS': 'text_fields',
      'NEW_DEVICE': 'devices_other',
      'HIGH_RISK_COUNTRY': 'public',
      'RAPID_TURNOVER': 'swap_horiz'
    };
    return iconMap[featureId || ''] || 'rule';
  }

  getScoreColorClass(score: number): string {
    if (score >= 90) return 'score-critical';
    if (score >= 75) return 'score-high';
    if (score >= 60) return 'score-medium';
    if (score >= 30) return 'score-low';
    return 'score-clear';
  }

  getScoreLabel(score: number): string {
    if (score >= 90) return 'CRITICAL RISK';
    if (score >= 75) return 'HIGH RISK';
    if (score >= 60) return 'MEDIUM RISK';
    if (score >= 30) return 'LOW RISK';
    return 'NO RISK';
  }
}