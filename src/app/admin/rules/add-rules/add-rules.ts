import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  RulesService,
  SubEngineCatalogEntry,
  SubEngineId,
  FeatureCatalogEntry,
  ParamSpec,
} from '../rules.service';
import { NotificationToastService } from '../../../data/services/notification-toast.service';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-add-rules',
  standalone: false,
  templateUrl: './add-rules.html',
  styleUrl: './add-rules.scss',
})
export class AddRules implements OnInit, OnDestroy {
  /** Sub-engine enabled toggle + dynamic feature params form. */
  form: FormGroup;

  /** Full sub-engine catalogue entry (used for display). */
  subEngine: SubEngineCatalogEntry | null = null;
  subEngineId: SubEngineId = 'RAW_TRANSACTION';

  isLoading = false;
  isSaving  = false;

  private subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private rulesService: RulesService,
    private route: ActivatedRoute,
    private router: Router,
    private snackbar: NotificationToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      enabled: [false],
      features: this.fb.group({}),
    });
  }

  ngOnInit(): void {
    // Route shape: edit/:subEngineId/:featureId  OR  edit/:subEngineId  OR  edit/:id (legacy)
    const subEngineParam = this.route.snapshot.paramMap.get('subEngineId');
    const legacyId       = this.route.snapshot.paramMap.get('id');

    this.subEngineId = (subEngineParam ?? legacyId ?? 'RAW_TRANSACTION') as SubEngineId;
    this.loadSubEngine();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  // ── Load ─────────────────────────────────────────────────────────────────
  loadSubEngine(): void {
    this.isLoading = true;
    this.subs.push(
      this.rulesService.getSubEngineCatalog(this.subEngineId).subscribe({
        next: (response) => {
          this.subEngine = response.result ?? null;
          if (!this.subEngine) {
            this.snackbar.alertError('Sub-engine not found');
            this.goBack();
            return;
          }

          // Build the features FormGroup from the catalogue
          this.buildFeaturesForm(this.subEngine.features ?? []);

          // Seed the sub-engine enabled toggle
          this.form.patchValue({ enabled: this.subEngine.enabled });

          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.snackbar.alertError('Failed to load sub-engine');
          this.isLoading = false;
        },
      })
    );
  }

  /**
   * Builds a nested FormGroup for every feature in the catalogue.
   * Each feature gets:
   *   - enabled: boolean
   *   - score:   number
   *   - params:  FormGroup (one control per ParamSpec)
   */
  private buildFeaturesForm(features: FeatureCatalogEntry[]): void {
    const featuresGroup = this.fb.group({});

    for (const feature of features) {
      const paramsGroup = this.fb.group({});

      for (const param of feature.params ?? []) {
        const defaultVal = this.resolveParamDefault(feature, param);
        paramsGroup.addControl(
          param.key,
          this.createParamControl(param, defaultVal)
        );
      }

      featuresGroup.addControl(
        feature.id,
        this.fb.group({
          enabled: [feature.enabledByDefault],
          score: [feature.defaultScore, [Validators.min(0), Validators.max(100)]],
          params: paramsGroup,
        })
      );
    }

    this.form.setControl('features', featuresGroup);
  }

  /** Picks the default value from defaultParams (falling back to param.defaultValue). */
  private resolveParamDefault(feature: FeatureCatalogEntry, param: ParamSpec): any {
    const fromDefaults = feature.defaultParams?.[param.key];
    if (fromDefaults !== undefined && fromDefaults !== null) return fromDefaults;
    return param.defaultValue;
  }

  /** Creates the correct AbstractControl for a given ParamSpec. */
  private createParamControl(param: ParamSpec, defaultValue: any) {
    switch (param.kind) {
      case 'STRING_LIST':
        // Multi-select: default to an array
        return this.fb.control(Array.isArray(defaultValue) ? defaultValue : []);
      case 'BOOLEAN':
        return this.fb.control(!!defaultValue);
      case 'NUMBER':
      case 'DECIMAL':
        return this.fb.control(defaultValue ?? null);
      case 'ENUM':
      case 'STRING':
      default:
        return this.fb.control(defaultValue ?? '');
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  onSubmit(): void {
    if (this.form.invalid) return;

    const enabled: boolean = this.form.value.enabled;
    this.isSaving = true;

    this.subs.push(
      this.rulesService.patchSubEngine(this.subEngineId, enabled).subscribe({
        next: () => {
          // Persist each feature's params + score + enabled state
          this.saveFeatures();
        },
        error: () => {
          this.snackbar.alertError('Failed to update sub-engine');
          this.isSaving = false;
        },
      })
    );
  }

  /** Saves every feature back to the backend via patchFeature. */
  private saveFeatures(): void {
    if (!this.subEngine?.features?.length) {
      this.finishSave();
      return;
    }

    const calls = this.subEngine.features.map((feature) => {
      const fg = this.form.get(['features', feature.id]) as FormGroup;
      const body = {
        enabled: fg.get('enabled')?.value ?? false,
        score: fg.get('score')?.value ?? feature.defaultScore,
        params: fg.get('params')?.value ?? {},
      };
      return this.rulesService.patchFeature(this.subEngineId, feature.id, body);
    });

    // Fire them sequentially to avoid hammering the backend
    let index = 0;
    const next = () => {
      if (index >= calls.length) {
        this.finishSave();
        return;
      }
      const call = calls[index++];
      this.subs.push(
        call.subscribe({
          next: () => next(),
          error: () => {
            this.snackbar.alertError(
              `Failed to update feature ${this.subEngine?.features?.[index - 1]?.id ?? ''}`
            );
            this.isSaving = false;
          },
        })
      );
    };
    next();
  }

  private finishSave(): void {
    this.snackbar.alertSuccess(
      `${this.subEngine?.label ?? this.subEngineId} updated successfully`
    );
    this.goBack();
  }

  onCancel(): void { this.goBack(); }

  onReset(): void {
    if (this.subEngine) {
      this.buildFeaturesForm(this.subEngine.features ?? []);
      this.form.patchValue({ enabled: this.subEngine.enabled });
    }
  }

  private goBack(): void {
    this.router.navigate(['/admin/assessments/rules']);
  }

  // ── Template helpers ──────────────────────────────────────────────────────

    // ── Tag input helpers (free-form STRING_LIST params) ──────────────────────

  /** Adds a tag to a STRING_LIST param when the user presses Enter/comma. */
  addTag(featureId: string, paramKey: string, event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (!value) return;

    const control = this.featureParamsGroup(featureId).get(paramKey);
    if (!control) return;

    const current: string[] = Array.isArray(control.value) ? control.value : [];

    // Avoid duplicates
    if (!current.includes(value)) {
      control.setValue([...current, value]);
      control.markAsDirty();
    }

    // Clear the input
    event.chipInput?.clear();
  }

  /** Removes a tag from a STRING_LIST param. */
  removeTag(featureId: string, paramKey: string, value: string): void {
    const control = this.featureParamsGroup(featureId).get(paramKey);
    if (!control) return;

    const current: string[] = Array.isArray(control.value) ? control.value : [];
    const next = current.filter((v) => v !== value);

    control.setValue(next);
    control.markAsDirty();
  }

  /** Returns the FormGroup for a feature. */
  featureGroup(featureId: string): FormGroup {
    return this.form.get(['features', featureId]) as FormGroup;
  }

  /** Returns the FormGroup holding params for a feature. */
  featureParamsGroup(featureId: string): FormGroup {
    return this.featureGroup(featureId).get('params') as FormGroup;
  }

  /** Whether a param should render as a multi-select. */
  isMultiSelect(param: ParamSpec): boolean {
    return (
      param.kind === 'STRING_LIST' ||
      param.uiControl === 'MULTI_SELECT' ||
      (param.allowedValues?.length ?? 0) > 1 &&
        (param.uiControl === 'SELECT' || param.uiControl === 'MULTI_SELECT')
    );
  }

  /** Whether a param should render as a single mat-select. */
  isSingleSelect(param: ParamSpec): boolean {
    return !this.isMultiSelect(param) && (
      param.kind === 'ENUM' ||
      param.uiControl === 'SELECT'
    );
  }

  /** Whether a param should render as a plain text input. */
  isTextInput(param: ParamSpec): boolean {
    return !this.isMultiSelect(param) && !this.isSingleSelect(param) && (
      param.kind === 'STRING' || param.uiControl === 'TEXT_INPUT'
    );
  }

  /** Whether a param should render as a number input. */
  isNumberInput(param: ParamSpec): boolean {
    return !this.isMultiSelect(param) && !this.isSingleSelect(param) && (
      param.kind === 'NUMBER' ||
      param.kind === 'DECIMAL' ||
      param.uiControl === 'NUMBER_INPUT'
    );
  }

  /** Whether a param should render as a tag input (free-form string list). */
  isTagInput(param: ParamSpec): boolean {
    return (
      param.kind === 'STRING_LIST' &&
      param.uiControl === 'TAG_INPUT' &&
      (!param.allowedValues || param.allowedValues.length === 0)
    );
  }

  getSubEngineIcon(id: string | null): string {
    const map: Record<string, string> = {
      RAW_TRANSACTION: 'receipt_long',
      PARTY:           'person_search',
      CHANNEL:         'router',
      DEVICE:          'devices',
      GEO:             'public',
      BENEFICIARY:     'account_tree',
    };
    return map[id ?? ''] ?? 'rule';
  }

  getFeatureIcon(featureId: string): string {
    const map: Record<string, string> = {
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
      HIGH_RISK_RATING:   'person_off',
      PEP:                'policy',
      SANCTIONS_HIT:      'gavel',
      ADVERSE_MEDIA:      'newspaper',
      NEW_CUSTOMER:       'person_add',
      DORMANT_ACCOUNT:    'lock_clock',
      INCOME_MULTIPLE:    'account_balance_wallet',
      BALANCE_MULTIPLE:   'balance',
      PEER_AMOUNT_OUTLIER:'bar_chart',
      PRIOR_ALERTS:       'warning',
      CONFIRMED_FRAUD:    'report',
    };
    return map[featureId] ?? 'rule';
  }

  getStatusIcon(status: string): string {
    return status === 'ACTIVE' ? 'check_circle' : 'schedule';
  }

  getScoreColorClass(score: number): string {
    if (score >= 90) return 'score-critical';
    if (score >= 75) return 'score-high';
    if (score >= 60) return 'score-medium';
    if (score >= 30) return 'score-low';
    return 'score-clear';
  }

  formatParams(f: FeatureCatalogEntry): string {
    const entries = Object.entries(f.defaultParams ?? {});
    if (!entries.length) return '—';
    return entries.map(([k, v]) => {
      const val = Array.isArray(v) ? (v.length ? v.join(', ') : '—') : String(v ?? '—');
      return `${k}: ${val}`;
    }).join(' · ');
  }
}