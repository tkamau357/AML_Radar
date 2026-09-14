import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HeaderAction, TableAction } from '../../../shared/components/dynamic-tables/dynamic-tables.component';
import { RulesService, EngineConfigRules, EngineFeatureRow, RawFeatureDef } from '../rules.service';
import { NotificationToastService } from '../../../data/services/notification-toast.service';

@Component({
  selector: 'app-rules',
  standalone: false,
  templateUrl: './rules.html',
  styleUrl: './rules.scss',
})
export class Rules implements OnInit, OnDestroy {
  featureRows: EngineFeatureRow[] = [];
  config: EngineConfigRules | null = null;
  isLoading = false;

  /** Controls whether the params expandable panel is available on rows. */
  showParamsExpand = true;

  columns = [
    { label: '#', field: 'index' },
    { label: 'Feature Name', field: 'featureName' },
    { label: 'Enabled', field: 'enabled', type: 'badge' },
    { label: 'Default Score', field: 'score', type: 'badge' },
  ];

  actions: TableAction<RawFeatureDef>[] = [
    {
      label: 'View',
      icon: 'visibility',
      onClick: (row: RawFeatureDef) => this.viewFeature(row),
    },
    {
      label: 'Edit',
      icon: 'edit',
      onClick: (row: RawFeatureDef) => this.editFeature(row),
    },
    // {
    //   label: 'Toggle',
    //   icon: 'toggle_on',
    //   onClick: (row: RawFeatureDef) => this.toggleFeature(row),
    // },
  ];

  headerActions: HeaderAction[] = [
    {
      icon: 'refresh',
      tooltip: 'Refresh',
      onClick: () => this.loadConfig(),
    },
    {
      icon: 'settings',
      tooltip: 'Engine Config',
      onClick: () => this.openConfig(),
    },
  ];

  private subs: Subscription[] = [];

  constructor(
    private rulesService: RulesService,
    private snackbar: NotificationToastService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadConfig();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadConfig(): void {
    this.isLoading = true;
    this.subs.push(
      this.rulesService.getConfig().subscribe({
        next: (response) => {
          this.config = response.result;
          this.featureRows = this.buildFeatureRows(this.config);
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

  /** Maps `rawTransaction.features` record into a flat array of display rows. */
  private buildFeatureRows(config: EngineConfigRules | null): EngineFeatureRow[] {
    const features = config?.rawTransaction?.features;
    if (!features) return [];

    return Object.entries(features).map(([name, cfg]) => ({
      featureName: name,
      enabled:     cfg.enabled,
      score:       cfg.score,
      params:      cfg.params ?? {},
      _expanded:   false,
      showParams:  this.showParamsExpand,
    }));
  }

  viewFeature(row: any): void {
    this.router.navigate(['/admin/assessments/rules/view', row.featureName]);
  }

  editFeature(row: any): void {
    this.router.navigate(['/admin/assessments/rules/edit', row.featureName]);
  }

  openConfig(): void {
    this.router.navigate(['/admin/assessments/rules/config']);
  }
}