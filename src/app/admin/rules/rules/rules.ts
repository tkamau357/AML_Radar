import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  HeaderAction,
  TableAction,
} from '../../../shared/components/dynamic-tables/dynamic-tables.component';
import { RulesService, SubEngineCatalogEntry } from '../rules.service';
import { NotificationToastService } from '../../../data/services/notification-toast.service';

/** Flat row shape fed into the dynamic table. */
export interface SubEngineRow {
  label: string;
  description: string;
  status: string;
  enabled: boolean;
  note: string;
  /** kept for action callbacks */
  _entry: SubEngineCatalogEntry;
}

@Component({
  selector: 'app-rules',
  standalone: false,
  templateUrl: './rules.html',
  styleUrl: './rules.scss',
})
export class Rules implements OnInit, OnDestroy {
  isLoading = false;

  /** Rows shown in the sub-engine table. */
  subEngineRows: SubEngineRow[] = [];

  columns = [
    { label: '#', field: 'index' },
    { label: 'Label',       field: 'label'                     },
    { label: 'Status',      field: 'status',   type: 'badge'   },
    { label: 'Enabled',     field: 'enabled',  type: 'badge'   },
  ];

  actions: TableAction<SubEngineRow>[] = [
    {
      label: 'Edit',
      icon: 'edit',
      onClick: (row: SubEngineRow) =>
        this.router.navigate([
          '/admin/assessments/rules/edit',
          row._entry.id,
        ]),
    },
    {
      label: 'View',
      icon: 'visibility',
      onClick: (row: SubEngineRow) =>
        this.router.navigate([
          '/admin/assessments/rules/view',
          row._entry.id,
        ]),
    },
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
    private cdr: ChangeDetectorRef
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
      this.rulesService.getCatalog().subscribe({
        next: (response) => {
          const subEngines = response.result?.subEngines ?? [];
          this.subEngineRows = subEngines.map((s) => ({
            label:       s.label,
            description: s.description,
            status:      s.status,
            enabled:     s.enabled,
            note:        s.note ?? '—',
            _entry:      s,
          }));
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.snackbar.alertError('Failed to load engine catalog');
          this.isLoading = false;
        },
      })
    );
  }

  openConfig(): void {
    this.router.navigate(['/admin/assessments/rules/config']);
  }
}