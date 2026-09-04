import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { TableAction, HeaderAction } from '../../../shared/components/dynamic-tables/dynamic-tables.component';
import { RulesService, RawFeatureDef, EngineConfigRules } from '../rules.service';
import { NotificationToastService } from '../../../data/services/notification-toast.service';

@Component({
  selector: 'app-rules',
  standalone: false,
  templateUrl: './rules.html',
  styleUrl: './rules.scss',
})
export class Rules implements OnInit, OnDestroy {
  features: RawFeatureDef[] = [];
  config: EngineConfigRules | null = null;
  isLoading = false;
  totalElements = 0;
  currentPage = 0;
  pageSize = 10;

  columns = [
    { label: '#',            field: 'index'                        },
    { label: 'Feature ID',   field: 'id'                           },
    { label: 'Label',        field: 'label'                        },
    { label: 'Score',        field: 'defaultScore', type: 'badge'  },
    { label: 'Enabled',      field: 'enabledByDefault', type: 'badge' },
    { label: 'History',      field: 'needsHistory', type: 'badge'  },
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
      onClick: () => this.loadCatalog(),
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
    this.loadCatalog();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadCatalog(): void {
    this.isLoading = true;
    this.subs.push(
      forkJoin({
        catalog: this.rulesService.getCatalog(),
        config:  this.rulesService.getConfig(),
      }).subscribe({
        next: ({ catalog, config }) => {
          this.features = catalog.result || [];
          this.config   = config.result;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.snackbar.alertError('Failed to load feature catalog');
          this.isLoading = false;
        },
      })
    );
  }

  viewFeature(row: RawFeatureDef): void {
    this.router.navigate(['/admin/assessments/rules/view', row.id]);
  }

  editFeature(row: RawFeatureDef): void {
    this.router.navigate(['/admin/assessments/rules/edit', row.id]);
  }

  toggleFeature(row: RawFeatureDef): void {
    const currentEnabled = this.getFeatureEnabled(row.id);
    this.subs.push(
      this.rulesService.patchFeature(row.id, { enabled: !currentEnabled }).subscribe({
        next: (response) => {
          this.config = response.result;
          this.snackbar.alertSuccess(`${row.label} ${!currentEnabled ? 'enabled' : 'disabled'}`);
          this.loadCatalog();
        },
        error: (err) => {
          this.snackbar.alertError('Failed to toggle feature');
        },
      })
    );
  }

  openConfig(): void {
    this.router.navigate(['/admin/assessments/rules/config']);
  }

  private getFeatureEnabled(featureId: string): boolean {
    return this.config?.features?.[featureId]?.enabled ?? 
      this.features.find(f => f.id === featureId)?.enabledByDefault ?? false;
  }
}