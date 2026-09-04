import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RulesService, RawFeatureDef } from '../rules.service';
import { NotificationToastService } from '../../../data/services/notification-toast.service';

@Component({
  selector: 'app-add-rules',
  standalone: false,
  templateUrl: './add-rules.html',
  styleUrl: './add-rules.scss',
})
export class AddRules implements OnInit, OnDestroy {
  featureForm: FormGroup;
  featureDef: RawFeatureDef | null = null;
  isEdit = false;
  isLoading = false;
  featureId: string | null = null;

  private subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private rulesService: RulesService,
    private route: ActivatedRoute,
    private router: Router,
    private snackbar: NotificationToastService,
    private cdr: ChangeDetectorRef,
  ) {
    this.featureForm = this.fb.group({
      enabled: [true],
      score: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      params: this.fb.group({}),
    });
  }

  ngOnInit(): void {
    this.featureId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.featureId;
    
    if (this.isEdit) {
      this.loadFeatureDef(this.featureId!);
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadFeatureDef(id: string): void {
    this.isLoading = true;
    this.subs.push(
      this.rulesService.getCatalog().subscribe({
        next: (response) => {
          const catalog = response.result || [];
          this.featureDef = catalog.find(f => f.id === id) || null;
          
          if (this.featureDef) {
            this.populateForm(this.featureDef);
            this.loadCurrentConfig(id);
          } else {
            this.snackbar.alertError('Feature not found in catalog');
            this.router.navigate(['/admin/assessments/rules']);
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.snackbar.alertError('Failed to load feature definitions');
          this.isLoading = false;
        },
      })
    );
  }

  loadCurrentConfig(id: string): void {
    this.subs.push(
      this.rulesService.getConfig().subscribe({
        next: (response) => {
          const config = response.result;
          const featureConfig = config?.features?.[id];
          
          if (featureConfig) {
            this.featureForm.patchValue({
              enabled: featureConfig.enabled,
              score: featureConfig.score,
            });
            
            const paramsGroup = this.featureForm.get('params') as FormGroup;
            Object.keys(featureConfig.params || {}).forEach(key => {
              if (paramsGroup.contains(key)) {
                paramsGroup.get(key)?.patchValue(featureConfig.params[key]);
              }
            });
          }
        },
        error: (err) => {
          this.snackbar.alertError('Failed to load current config');
        },
      })
    );
  }

  populateForm(featureDef: RawFeatureDef): void {
    const paramsGroup = this.fb.group({});
    
    featureDef.params.forEach(param => {
      const defaultValue = featureDef.defaultParams?.[param.key] ?? param.defaultValue;
      paramsGroup.addControl(
        param.key,
        this.fb.control(defaultValue, param.kind === 'DECIMAL' || param.kind === 'NUMBER' ? Validators.required : [])
      );
    });
    
    this.featureForm.setControl('params', paramsGroup);
    this.featureForm.patchValue({
      enabled: featureDef.enabledByDefault,
      score: featureDef.defaultScore,
    });
  }

  onSubmit(): void {
    if (this.featureForm.invalid || !this.featureId) {
      this.snackbar.alertError('Please fill in all required fields');
      return;
    }

    const formValue = this.featureForm.value;
    const body = {
      enabled: formValue.enabled,
      score: formValue.score,
      params: formValue.params,
    };

    this.isLoading = true;
    this.subs.push(
      this.rulesService.patchFeature(this.featureId, body).subscribe({
        next: (response) => {
          this.snackbar.alertSuccess(`Feature ${this.featureId} updated successfully`);
          this.router.navigate(['/admin/assessments/rules']);
        },
        error: (err) => {
          this.snackbar.alertError('Failed to update feature');
          this.isLoading = false;
        },
      })
    );
  }

  onCancel(): void {
    this.router.navigate(['/admin/assessments/rules']);
  }

  onReset(): void {
    if (this.featureDef) {
      this.populateForm(this.featureDef);
      this.featureForm.patchValue({
        enabled: this.featureDef.enabledByDefault,
        score: this.featureDef.defaultScore,
      });
    }
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

  getParamIcon(paramKey: string): string {
    const iconMap: Record<string, string> = {
      'operator': 'compare_arrows',
      'threshold': 'attach_money',
      'currency': 'currency_exchange',
      'applyToTypes': 'category',
      'applyToChannels': 'router',
      'windowMinutes': 'schedule',
      'maxCount': 'numbers',
      'maxVolume': 'swap_vert',
      'groupBy': 'group',
      'onMissing': 'error_outline',
      'keywords': 'search',
      'reportingThreshold': 'flag',
      'bandPct': 'percent',
      'divisor': 'divide',
      'minAmount': 'money_off',
      'startHour': 'timer',
      'endHour': 'timer',
      'timezone': 'public',
      'riskProfiles': 'shield',
      'channels': 'router',
      'types': 'category',
      'countries': 'public',
      'baseCurrency': 'currency_exchange',
      'mode': 'tune',
      'flaggedCurrencies': 'flag',
      'proximityPct': 'close',
      'windowHours': 'schedule',
      'minCount': 'numbers',
      'amountTolerancePct': 'percent',
      'deviceId': 'devices',
      'ipAddress': 'language',
      'sessionId': 'fingerprint',
      'newDevice': 'smartphone'
    };
    return iconMap[paramKey] || '';
  }

  getCurrentScore(): number {
    return this.featureForm.get('score')?.value || this.featureDef?.defaultScore || 0;
  }

  getScoreColorClass(score: number): string {
    if (score >= 90) return 'score-critical';
    if (score >= 75) return 'score-high';
    if (score >= 60) return 'score-medium';
    if (score >= 30) return 'score-low';
    return 'score-clear';
  }
}