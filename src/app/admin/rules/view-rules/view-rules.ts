import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  RulesService,
  SubEngineCatalogEntry,
  SubEngineId,
  FeatureCatalogEntry,
} from '../rules.service';
import { NotificationToastService } from '../../../data/services/notification-toast.service';

@Component({
  selector: 'app-view-rules',
  standalone: false,
  templateUrl: './view-rules.html',
  styleUrl: './view-rules.scss',
})
export class ViewRules implements OnInit, OnDestroy {
  /** Full sub-engine entry returned by getSubEngineCatalog. */
  subEngine: SubEngineCatalogEntry | null = null;

  /** The sub-engine id taken from the route param. */
  subEngineId: SubEngineId | null = null;

  isLoading = false;

  /** Flat rows for the features table. */
  featureRows: FeatureRow[] = [];

  featureColumns = [
    { label: '#',             field: 'index'            },
    { label: 'Feature',       field: 'label'            },
    { label: 'Description',   field: 'description'      },
    { label: 'Needs History', field: 'needsHistory',  type: 'badge' },
    { label: 'Default Score', field: 'defaultScore'     },
    { label: 'Enabled',       field: 'enabledByDefault', type: 'badge' },
  ];

  private subs: Subscription[] = [];

  constructor(
    private rulesService: RulesService,
    private route: ActivatedRoute,
    private router: Router,
    private snackbar: NotificationToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') as SubEngineId | null;
    if (!id) {
      this.snackbar.alertError('No sub-engine ID provided');
      this.router.navigate(['/admin/assessments/rules']);
      return;
    }
    this.subEngineId = id;
    this.loadSubEngine(id);
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadSubEngine(id: SubEngineId): void {
    this.isLoading = true;
    this.subs.push(
      this.rulesService.getSubEngineCatalog(id).subscribe({
        next: (response) => {
          this.subEngine = response.result ?? null;
          this.featureRows = (this.subEngine?.features ?? []).map((f) => ({
            label:           f.label,
            description:     f.description,
            needsHistory:    f.needsHistory,
            defaultScore:    f.defaultScore,
            enabledByDefault: f.enabledByDefault,
            paramCount:      f.params?.length ?? 0,
            _feature:        f,
          }));
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.snackbar.alertError('Failed to load sub-engine details');
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      })
    );
  }

  backToList(): void {
    this.router.navigate(['/admin/assessments/rules']);
  }

  editFeature(row: FeatureRow): void {
    this.router.navigate([
      '/admin/assessments/rules/edit',
      this.subEngineId,
      row._feature.id,
    ]);
  }

  // ── Template helpers ────────────────────────────────────────────────────

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

  getScoreColorClass(score: number): string {
    if (score >= 90) return 'score-critical';
    if (score >= 75) return 'score-high';
    if (score >= 60) return 'score-medium';
    if (score >= 30) return 'score-low';
    return 'score-clear';
  }

  getStatusChipClass(status: string): string {
    return status === 'ACTIVE' ? 'chip--active' : 'chip--planned';
  }

  getStatusIcon(status: string): string {
    return status === 'ACTIVE' ? 'check_circle' : 'schedule';
  }
}

export interface FeatureRow {
  label: string;
  description: string;
  needsHistory: boolean;
  defaultScore: number;
  enabledByDefault: boolean;
  paramCount: number;
  _feature: FeatureCatalogEntry;
}
