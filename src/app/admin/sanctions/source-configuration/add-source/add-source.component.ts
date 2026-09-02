import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { SanctionsService, SourceConfigResponse, SourceConfigRequest, AcquisitionMode, SyncStrategyType } from '../../sanctions.service';
import { SnackbarService } from '../../../../shared/services/snackbar.service';
import { LoadingService } from '../../../../core/service/loading.service';

@Component({
  selector: 'app-add-source',
  standalone: false,
  templateUrl: './add-source.component.html',
  styleUrl: './add-source.component.scss',
})
export class AddSourceComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isSubmitting = false;
  isLoading = false;
  isEditMode = false;
  isViewMode = false;
  editSource: string | null = null;
  sourceData: SourceConfigResponse | null = null;

  acquisitionModes: { value: AcquisitionMode; label: string }[] = [
    { value: 'API', label: 'API' },
    { value: 'FILE_DOWNLOAD', label: 'File Download' },
    { value: 'SFTP', label: 'SFTP' },
    { value: 'DATABASE', label: 'Database' },
    { value: 'MANUAL_UPLOAD', label: 'Manual Upload' },
  ];

  syncStrategies: { value: SyncStrategyType; label: string; description: string }[] = [
    { value: 'FULL_REPLACE', label: 'Full Replace', description: 'Download all records, compare with existing, update/add/delist accordingly' },
    { value: 'DELTA_ONLY', label: 'Delta Only', description: 'Only fetch additions, deletions, and changes from delta files/endpoints' },
    { value: 'HYBRID', label: 'Hybrid', description: 'Delta sync daily, full reconciliation on schedule (e.g., weekly)' },
    { value: 'INCREMENTAL', label: 'Incremental', description: 'Query source by timestamp field for new/updated records' },
  ];

  availableSources = [
    'OFAC_SDN', 'OFAC_CONSOLIDATED', 'UN_CONSOLIDATED', 'EU_CONSOLIDATED', 'UK_HMT', 'INTERPOL',
    'KRA_TAX_DEFAULTERS', 'KRA_DEREGISTERED', 'CBK_DEBARRED', 'CBK_FOREX_BUREAUS',
    'FRC_WATCHLIST', 'PPRA_DEBARRED', 'DCI_WANTED', 'EACC_CASES', 'NSE_SUSPENDED', 'IRA_DEREGISTERED',
    'EAC_WATCHLIST', 'AU_SANCTIONS', 'PEP', 'PEP_INTERNATIONAL', 'ADVERSE_MEDIA', 'CUSTOM'
  ];

  private subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private service: SanctionsService,
    private snack: SnackbarService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    public loadingService: LoadingService,
  ) {}

  ngOnInit(): void {
    this.initForm();

    const source = this.route.snapshot.paramMap.get('source');
    const url = this.router.url;

    if (url.includes('/view/') && source) {
      this.isViewMode = true;
      this.editSource = source;
      this.loadSource(source);
    } else if (source) {
      this.isEditMode = true;
      this.editSource = source;
      this.loadSource(source);
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  private initForm(): void {
    this.form = this.fb.group({
      source: ['', Validators.required],
      displayName: ['', Validators.required],
      description: [''],
      enabled: [true],
      acquisitionMode: ['MANUAL_UPLOAD', Validators.required],
      syncEnabled: [false],
      syncCron: [''],
      // Sync Strategy Configuration
      syncStrategy: ['FULL_REPLACE'],
      deltaAdditionsUrl: [''],
      deltaDeletionsUrl: [''],
      deltaChangesUrl: [''],
      fullReconciliationCron: [''],
      incrementalField: [''],
      uniqueIdField: ['sourceEntryId'],
      hashFields: ['fullName,dateOfBirth,nationality,aliases'],
      retentionDays: [365],
      // Acquisition Config - API
      apiUrl: [''],
      apiKey: [''],
      apiFormat: ['JSON'],
      authType: ['NONE'],
      dataPath: [''],
      // Acquisition Config - SFTP
      sftpHost: [''],
      sftpPort: [22],
      sftpUsername: [''],
      sftpPassword: [''],
      sftpPath: [''],
      filePattern: [''],
      fileType: ['XML'],
      // Acquisition Config - File Download
      downloadUrl: [''],
      // Acquisition Config - Database
      dbUrl: [''],
      dbUsername: [''],
      dbPassword: [''],
      dbQuery: [''],
      deletedAtField: [''],
      // Thresholds
      hitThresholdOverride: [null],
      potentialThresholdOverride: [null],
      matchThresholdOverride: [null],
      mappingTemplateId: [''],
    });
  }

  private loadSource(source: string): void {
    this.isLoading = true;
    const sub = this.service.getSourceConfig(source).pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data: SourceConfigResponse) => {
        this.sourceData = data;
        this.patchForm(data);
        if (this.isEditMode || this.isViewMode) {
          this.form.get('source')?.disable();
        }
        if (this.isViewMode) {
          this.form.disable();
        }
      },
      error: (err) => {
        this.snack.alertError(err?.error?.message || 'Failed to load source');
        this.router.navigate(['/admin/sanctions/sources']);
      },
    });
    this.subs.push(sub);
  }

  private patchForm(data: SourceConfigResponse): void {
    this.form.patchValue({
      source: data.source,
      displayName: data.displayName,
      description: data.description || '',
      enabled: data.enabled,
      acquisitionMode: data.acquisitionMode,
      syncEnabled: data.syncEnabled,
      syncCron: data.syncCron || '',
      // Sync Strategy Configuration
      syncStrategy: data.syncStrategy || 'FULL_REPLACE',
      deltaAdditionsUrl: data.deltaAdditionsUrl || '',
      deltaDeletionsUrl: data.deltaDeletionsUrl || '',
      deltaChangesUrl: data.deltaChangesUrl || '',
      fullReconciliationCron: data.fullReconciliationCron || '',
      incrementalField: data.incrementalField || '',
      uniqueIdField: data.uniqueIdField || 'sourceEntryId',
      hashFields: data.hashFields || 'fullName,dateOfBirth,nationality,aliases',
      retentionDays: data.retentionDays || 365,
      // Thresholds
      hitThresholdOverride: data.hitThresholdOverride,
      potentialThresholdOverride: data.potentialThresholdOverride,
      matchThresholdOverride: data.matchThresholdOverride,
      mappingTemplateId: data.mappingTemplateId || '',
    });

    // Parse acquisition config
    const config = data.acquisitionConfig || {};
    if (data.acquisitionMode === 'API') {
      this.form.patchValue({
        apiUrl: config['url'] || '',
        apiKey: config['apiKey'] || '',
        apiFormat: config['format'] || 'JSON',
        authType: config['authType'] || 'NONE',
        dataPath: config['dataPath'] || '',
      });
    } else if (data.acquisitionMode === 'SFTP') {
      this.form.patchValue({
        sftpHost: config['host'] || '',
        sftpPort: config['port'] || 22,
        sftpUsername: config['username'] || '',
        sftpPassword: config['password'] || '',
        sftpPath: config['path'] || '',
        filePattern: config['filePattern'] || '',
        fileType: config['fileType'] || 'XML',
      });
    } else if (data.acquisitionMode === 'FILE_DOWNLOAD') {
      this.form.patchValue({
        downloadUrl: config['url'] || '',
        fileType: config['fileType'] || 'XML',
      });
    } else if (data.acquisitionMode === 'DATABASE') {
      this.form.patchValue({
        dbUrl: config['jdbcUrl'] || '',
        dbUsername: config['username'] || '',
        dbPassword: config['password'] || '',
        dbQuery: config['query'] || '',
        deletedAtField: config['deletedAtField'] || '',
      });
    }
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting) return;
    this.isSubmitting = true;

    const raw = this.form.getRawValue();
    const acquisitionConfig = this.buildAcquisitionConfig(raw);

    const payload: SourceConfigRequest = {
      source: raw.source,
      displayName: raw.displayName,
      description: raw.description || undefined,
      enabled: raw.enabled,
      acquisitionMode: raw.acquisitionMode,
      acquisitionConfig: acquisitionConfig,
      syncEnabled: raw.syncEnabled,
      syncCron: raw.syncCron || undefined,
      // Sync Strategy Configuration
      syncStrategy: raw.syncStrategy || undefined,
      deltaAdditionsUrl: raw.deltaAdditionsUrl || undefined,
      deltaDeletionsUrl: raw.deltaDeletionsUrl || undefined,
      deltaChangesUrl: raw.deltaChangesUrl || undefined,
      fullReconciliationCron: raw.fullReconciliationCron || undefined,
      incrementalField: raw.incrementalField || undefined,
      uniqueIdField: raw.uniqueIdField || undefined,
      hashFields: raw.hashFields || undefined,
      retentionDays: raw.retentionDays || undefined,
      // Thresholds
      hitThresholdOverride: raw.hitThresholdOverride || undefined,
      potentialThresholdOverride: raw.potentialThresholdOverride || undefined,
      matchThresholdOverride: raw.matchThresholdOverride || undefined,
      mappingTemplateId: raw.mappingTemplateId || undefined,
    };

    const call$ = this.isEditMode && this.editSource
      ? this.service.updateSourceConfig(this.editSource, payload)
      : this.service.createSourceConfig(payload);

    const sub = call$.pipe(
      finalize(() => {
        this.isSubmitting = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: () => {
        this.snack.alertSuccess(
          this.isEditMode ? 'Source updated successfully' : 'Source created successfully'
        );
        this.router.navigate(['/admin/sanctions/sources']);
      },
      error: (err) => {
        this.snack.alertError(err?.error?.message || 'Operation failed');
      },
    });
    this.subs.push(sub);
  }

  private buildAcquisitionConfig(raw: any): Record<string, any> {
    const mode = raw.acquisitionMode;
    switch (mode) {
      case 'API':
        return {
          url: raw.apiUrl,
          apiKey: raw.apiKey,
          format: raw.apiFormat,
          authType: raw.authType,
          dataPath: raw.dataPath,
        };
      case 'SFTP':
        return {
          host: raw.sftpHost,
          port: raw.sftpPort,
          username: raw.sftpUsername,
          password: raw.sftpPassword,
          path: raw.sftpPath,
          filePattern: raw.filePattern,
          fileType: raw.fileType,
        };
      case 'FILE_DOWNLOAD':
        return {
          url: raw.downloadUrl,
          fileType: raw.fileType,
        };
      case 'DATABASE':
        return {
          jdbcUrl: raw.dbUrl,
          username: raw.dbUsername,
          password: raw.dbPassword,
          query: raw.dbQuery,
          deletedAtField: raw.deletedAtField,
        };
      default:
        return {};
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/sanctions/sources']);
  }

  err(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c.touched);
  }

  get selectedMode(): string {
    return this.form.get('acquisitionMode')?.value || '';
  }

  get selectedStrategy(): string {
    return this.form.get('syncStrategy')?.value || '';
  }

  get showDeltaUrls(): boolean {
    const strategy = this.selectedStrategy;
    return strategy === 'DELTA_ONLY' || strategy === 'HYBRID';
  }

  get showIncrementalField(): boolean {
    return this.selectedStrategy === 'INCREMENTAL' && this.selectedMode === 'DATABASE';
  }

  get showFullReconciliationCron(): boolean {
    return this.selectedStrategy === 'HYBRID';
  }
}
