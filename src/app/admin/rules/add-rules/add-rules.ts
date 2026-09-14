import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RulesService, EngineConfigRules, FeatureConfig } from '../rules.service';
import { NotificationToastService } from '../../../data/services/notification-toast.service';

/** A single editable param entry derived from the live engine config. */
export interface ParamEntry {
  key: string;
  value: any;
  /** Inferred input type: 'number' | 'boolean' | 'array' | 'text' */
  kind: 'number' | 'boolean' | 'array' | 'text';
}

@Component({
  selector: 'app-add-rules',
  standalone: false,
  templateUrl: './add-rules.html',
  styleUrl: './add-rules.scss',
})
export class AddRules implements OnInit, OnDestroy {
  featureForm: FormGroup;

  /** The live FeatureConfig for the selected feature, loaded from getConfig(). */
  featureConfig: FeatureConfig | null = null;

  /** Param definitions derived from featureConfig.params for template rendering. */
  paramEntries: ParamEntry[] = [];

  /**
   * Live tag lists for array-kind params.
   * Key = param.key, value = current list of string tags being edited.
   * Kept in sync with the corresponding FormControl (which holds a string[]).
   */
  tagLists: Record<string, string[]> = {};

  /**
   * Per-param transient text in the tag text field before it is committed.
   */
  tagInputValues: Record<string, string> = {};

  featureId: string | null = null;
  isEdit = false;
  isLoading = false;

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
      score:   [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      params:  this.fb.group({}),
    });
  }

  ngOnInit(): void {
    this.featureId = this.route.snapshot.paramMap.get('id');
    this.isEdit    = !!this.featureId;

    if (this.isEdit) {
      this.loadFeature(this.featureId!);
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  // ── Load ──────────────────────────────────────────────────────────────────

  loadFeature(id: string): void {
    this.isLoading = true;
    this.subs.push(
      this.rulesService.getConfig().subscribe({
        next: (response) => {
          const config: EngineConfigRules = response.result;
          const feature = config?.rawTransaction?.features?.[id] ?? null;

          if (!feature) {
            this.snackbar.alertError(`Feature "${id}" not found in engine config`);
            this.router.navigate(['/admin/assessments/rules']);
            return;
          }

          this.featureConfig = feature;
          this.paramEntries  = this.buildParamEntries(feature.params ?? {});
          this.buildForm(feature);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.snackbar.alertError('Failed to load engine config');
          this.isLoading = false;
        },
      }),
    );
  }

  // ── Form builders ─────────────────────────────────────────────────────────

  private buildParamEntries(params: Record<string, any>): ParamEntry[] {
    return Object.entries(params).map(([key, value]) => ({
      key,
      value,
      kind: this.inferKind(value),
    }));
  }

  private inferKind(value: any): ParamEntry['kind'] {
    if (Array.isArray(value))       return 'array';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number')  return 'number';
    return 'text';
  }

  private buildForm(feature: FeatureConfig): void {
    const paramsGroup = this.fb.group({});
    this.tagLists      = {};
    this.tagInputValues = {};

    Object.entries(feature.params ?? {}).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Store as a real array in the form control
        const tags = [...value];
        paramsGroup.addControl(key, new FormControl(tags));
        this.tagLists[key]       = tags;
        this.tagInputValues[key] = '';
      } else {
        paramsGroup.addControl(key, new FormControl(value));
      }
    });

    this.featureForm.setControl('params', paramsGroup);
    this.featureForm.patchValue({
      enabled: feature.enabled,
      score:   feature.score,
    });
  }

  // ── Tag-input API ─────────────────────────────────────────────────────────

  /**
   * Add the current typed text as a new tag.
   * Called on Enter, comma, or Tab keypress.
   */
  addTag(paramKey: string): void {
    const raw = (this.tagInputValues[paramKey] ?? '').trim();
    if (!raw) return;

    // Split by comma so pasting "a, b, c" works in one go
    const newTags = raw
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !this.tagLists[paramKey].includes(s));

    if (newTags.length === 0) {
      this.tagInputValues[paramKey] = '';
      return;
    }

    this.tagLists[paramKey] = [...this.tagLists[paramKey], ...newTags];
    this.tagInputValues[paramKey] = '';
    this.syncTagControl(paramKey);
  }

  /** Remove a tag by index. */
  removeTag(paramKey: string, index: number): void {
    this.tagLists[paramKey] = this.tagLists[paramKey].filter((_, i) => i !== index);
    this.syncTagControl(paramKey);
  }

  /** Handle keydown in the tag text field. */
  onTagKeydown(event: KeyboardEvent, paramKey: string): void {
    if (event.key === 'Enter' || event.key === ',' || event.key === 'Tab') {
      event.preventDefault();
      this.addTag(paramKey);
      return;
    }
    // Backspace on empty input removes the last tag
    if (event.key === 'Backspace' && !this.tagInputValues[paramKey] && this.tagLists[paramKey].length > 0) {
      this.removeTag(paramKey, this.tagLists[paramKey].length - 1);
    }
  }

  private syncTagControl(paramKey: string): void {
    const ctrl = (this.featureForm.get('params') as FormGroup).get(paramKey);
    ctrl?.setValue([...this.tagLists[paramKey]]);
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  onSubmit(): void {
    if (this.featureForm.invalid || !this.featureId) {
      this.snackbar.alertError('Please fill in all required fields');
      return;
    }

    const raw = this.featureForm.value;

    const params: Record<string, any> = {};
    Object.entries(raw.params as Record<string, any>).forEach(([key, val]) => {
      const original = this.featureConfig?.params?.[key];
      if (Array.isArray(original)) {
        // Value is already a string[] from the form control
        params[key] = Array.isArray(val) ? val : [];
      } else if (typeof original === 'number') {
        params[key] = val === '' || val === null ? null : Number(val);
      } else if (typeof original === 'boolean') {
        params[key] = Boolean(val);
      } else {
        params[key] = val;
      }
    });

    const body = {
      enabled: raw.enabled,
      score:   raw.score,
      params,
    };

    this.isLoading = true;
    this.subs.push(
      this.rulesService.patchFeature(this.featureId, body).subscribe({
        next: () => {
          this.snackbar.alertSuccess(`Feature ${this.featureId} updated successfully`);
          this.router.navigate(['/admin/assessments/rules']);
        },
        error: () => {
          this.snackbar.alertError('Failed to update feature');
          this.isLoading = false;
        },
      }),
    );
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  onCancel(): void {
    this.router.navigate(['/admin/assessments/rules']);
  }

  onReset(): void {
    if (this.featureConfig) {
      this.buildForm(this.featureConfig);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  getCurrentScore(): number {
    return this.featureForm.get('score')?.value ?? 0;
  }

  getScoreClass(score: number): string {
    if (score >= 90) return 'bg-danger';
    if (score >= 75) return 'bg-warning';
    if (score >= 60) return 'bg-info';
    if (score >= 30) return 'bg-primary';
    return 'bg-secondary';
  }

  getScoreColorClass(score: number): string {
    if (score >= 90) return 'score-critical';
    if (score >= 75) return 'score-high';
    if (score >= 60) return 'score-medium';
    if (score >= 30) return 'score-low';
    return 'score-clear';
  }

  getFeatureIcon(featureId?: string): string {
    const iconMap: Record<string, string> = {
      AMOUNT_ABSOLUTE:    'payments',
      AMOUNT_JUST_BELOW:  'trending_down',
      AMOUNT_ROUND:       'circle',
      VELOCITY_COUNT:     'speed',
      VELOCITY_VOLUME:    'swap_vert',
      STRUCTURING:        'call_split',
      OFF_HOURS:          'schedule',
      WEEKEND:            'event_available',
      CHANNEL_RISK:       'router',
      TYPE_RISK:          'category',
      CURRENCY_UNUSUAL:   'currency_exchange',
      NARRATION_KEYWORDS: 'text_fields',
      NEW_DEVICE:         'devices_other',
      HIGH_RISK_COUNTRY:  'public',
      RAPID_TURNOVER:     'swap_horiz',
    };
    return iconMap[featureId ?? ''] || 'rule';
  }

  getParamIcon(key: string): string {
    const iconMap: Record<string, string> = {
      operator:            'compare_arrows',
      threshold:           'attach_money',
      currency:            'currency_exchange',
      applyToTypes:        'category',
      applyToChannels:     'router',
      windowMinutes:       'schedule',
      windowHours:         'schedule',
      maxCount:            'numbers',
      maxVolume:           'swap_vert',
      groupBy:             'group',
      onMissing:           'error_outline',
      keywords:            'search',
      reportingThreshold:  'flag',
      bandPct:             'percent',
      divisor:             'calculate',
      minAmount:           'money_off',
      startHour:           'timer',
      endHour:             'timer',
      timezone:            'public',
      riskProfiles:        'shield',
      channels:            'router',
      types:               'category',
      countries:           'public',
      baseCurrency:        'currency_exchange',
      mode:                'tune',
      flaggedCurrencies:   'flag',
      proximityPct:        'close',
      minCount:            'numbers',
      amountTolerancePct:  'percent',
    };
    return iconMap[key] || 'settings';
  }

  getParamHint(entry: ParamEntry): string {
    switch (entry.kind) {
      case 'array':   return 'Press Enter, Tab or comma to add a value · Backspace to remove last';
      case 'number':  return 'Numeric value';
      case 'boolean': return 'Toggle on / off';
      default:        return '';
    }
  }

  /** Template-safe display of a param's original value. */
  formatParamValue(entry: ParamEntry): string {
    const v = entry.value;
    if (Array.isArray(v))                          return v.length ? v.join(', ') : '—';
    if (v === null || v === undefined || v === '') return '—';
    return String(v);
  }
}
