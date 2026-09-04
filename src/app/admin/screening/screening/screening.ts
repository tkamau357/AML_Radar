import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription, finalize } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TableAction, HeaderAction } from '../../../shared/components/dynamic-tables/dynamic-tables.component';
import {
  ScreeningService,
  ScreeningResponse,
  ScreeningRequest,
  SanctionListSource,
  ScreeningCategory,
  MatchResult,
  RiskLevel,
  MatchType,
  ScreeningStatus,
  ScreeningConfigResponse
} from '../screening.service';
import { ScreeningDialog } from '../screening-dialog/screening-dialog';
import { SanctionListSourceInfo, SanctionsService } from '../../sanctions/sanctions.service';
import { NotificationToastService } from '../../../data/services/notification-toast.service';

@Component({
  selector: 'app-screening',
  standalone: false,
  templateUrl: './screening.html',
  styleUrl: './screening.scss',
})
export class Screening implements OnInit, OnDestroy {
  // Filter Form
  screeningForm!: FormGroup;

  // Screening Results
  screeningHistory: ScreeningResponse[] = [];
  screeningDataSource!: MatTableDataSource<ScreeningResponse>;
  displayedColumns: string[] = ['searchedName', 'matchCount', 'status', 'thresholdUsed', 'timestamp', 'actions'];

  // Config
  screeningConfig!: ScreeningConfigResponse;
  sources: SanctionListSourceInfo[] = [];

  // Loading States
  isScreening = false;
  isLoadingHistory = false;
  isLoadingConfig = false;

  availableSources = [
    'OFAC_SDN', 'OFAC_CONSOLIDATED', 'UN_CONSOLIDATED', 'EU_CONSOLIDATED', 'UK_HMT', 'INTERPOL',
    'KRA_TAX_DEFAULTERS', 'KRA_DEREGISTERED', 'CBK_DEBARRED', 'CBK_FOREX_BUREAUS',
    'FRC_WATCHLIST', 'PPRA_DEBARRED', 'DCI_WANTED', 'EACC_CASES', 'NSE_SUSPENDED', 'IRA_DEREGISTERED',
    'EAC_WATCHLIST', 'AU_SANCTIONS', 'PEP', 'PEP_INTERNATIONAL', 'ADVERSE_MEDIA', 'CUSTOM'
  ];
  screeningCategories = Object.values(ScreeningCategory);
  riskLevels = Object.values(RiskLevel);
  matchTypes = Object.values(MatchType);

  private subscriptions: Subscription[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Pagination
  pageSize = 10;
  pageIndex = 0;
  totalElements = 0;

  constructor(
    private screeningService: ScreeningService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private snackbar: NotificationToastService,
    private sanctionsService: SanctionsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadSources();
    this.loadScreeningConfig();
    this.loadScreeningHistory();
    // Initialize data source
    this.screeningDataSource = new MatTableDataSource(this.screeningHistory);
    this.screeningDataSource.paginator = this.paginator;
    this.screeningDataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeForm(): void {
    this.screeningForm = this.fb.group({
      name: [''],
      sources: [[]],
      matchThreshold: [80],
      maxResults: [10],
      country: [''],
      entityType: [''],
      dateOfBirth: [''],
      searchTerm: ['']
    });
  }

  // ========== CONFIG LOADING ==========
  loadSources(): void {
    const sub = this.sanctionsService.getSources().subscribe({
      next: (sources: any) => {
        this.sources = sources;
        
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.snackbar.alertError(err?.error?.message || 'Failed to load sources');
      },
    });
    this.subscriptions.push(sub);
  }

  private loadScreeningConfig(): void {
    this.isLoadingConfig = true;
    const sub = this.screeningService.getConfig()
      .pipe(finalize(() => {
        this.isLoadingConfig = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (config) => {
          this.screeningConfig = config;
          // Apply config defaults to form
          if (config) {
            this.screeningForm.patchValue({
              matchThreshold: config.thresholds?.match ?? 80
            });
          }
        },
        error: (err) => {
          this.snackbar.alertError('Failed to load screening configuration');
        }
      });
    this.subscriptions.push(sub);
  }

  loadScreeningHistory(): void {
    this.isLoadingHistory = true;
    // Note: No endpoint provided for history retrieval in the controller,
    // so we'll store results in memory for the session
    this.isLoadingHistory = false;
    this.cdr.detectChanges();
  }

  onScreen(): void {
    if (this.screeningForm.invalid) {
      this.snackbar.alertError('Please fill in required fields');
      return;
    }

    const request: ScreeningRequest = this.buildScreeningRequest();
    
    this.isScreening = true;
    const sub = this.screeningService.screen(request)
      .pipe(finalize(() => {
        this.isScreening = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (response) => {
          this.handleScreeningResponse(response);
        },
        error: (err) => {
          this.snackbar.alertError('Screening failed. Please try again.');
        }
      });
    this.subscriptions.push(sub);
  }

  private buildScreeningRequest(): ScreeningRequest {
    const formValues = this.screeningForm.value;
    return {
      name: formValues.name,
      sources: formValues.sources?.length > 0 ? formValues.sources : undefined,
      matchThreshold: formValues.matchThreshold,
      maxResults: formValues.maxResults,
      country: formValues.country || undefined,
      entityType: formValues.entityType || undefined,
      dateOfBirth: formValues.dateOfBirth || undefined
    };
  }

  /**
   * Handle screening response and open dialog
   */
  private handleScreeningResponse(response: ScreeningResponse): void {
    // Add to history
    this.screeningHistory.unshift(response);
    this.totalElements = this.screeningHistory.length;
    
    // Update data source
    this.screeningDataSource = new MatTableDataSource(this.screeningHistory);
    this.screeningDataSource.paginator = this.paginator;
    this.screeningDataSource.sort = this.sort;
    
    // Open results dialog
    const dialogRef = this.dialog.open(ScreeningDialog, {
      width: '800px',
      maxWidth: '95vw',
      data: response,
      panelClass: 'screening-dialog-panel'
    });

    const sub = dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'viewMatch') {
        this.navigateToMatchDetails(result.match);
      } else if (result?.action === 'viewAll') {
        this.navigateToAllMatches(response);
      }
    });
    this.subscriptions.push(sub);

    this.snackbar.alertSuccess(`Screening completed: ${response.matchCount} matches found`);
  }

  onReset(): void {
    this.screeningForm.reset({
      name: '',
      sources: [],
      matchThreshold: this.screeningConfig?.thresholds?.match ?? 80,
      maxResults: 10,
      country: '',
      entityType: '',
      dateOfBirth: '',
      searchTerm: ''
    });
  }

  onClearSearch(): void {
    this.screeningForm.patchValue({ searchTerm: '' });
    if (this.screeningDataSource) {
      this.screeningDataSource.filter = '';
    }
  }

  private navigateToMatchDetails(match: MatchResult): void {
    // Navigate to match details route or open detail view
    this.snackbar.alertInfo(`Viewing match details for: ${match.fullName}`);
  }

  private navigateToAllMatches(response: ScreeningResponse): void {
    // Navigate to full results page
    this.snackbar.alertInfo('Opening full results view');
  }

  viewScreeningResult(row: ScreeningResponse): void {
    const dialogRef = this.dialog.open(ScreeningDialog, {
      width: '800px',
      maxWidth: '95vw',
      data: row,
      panelClass: 'screening-dialog-panel'
    });

    const sub = dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'viewMatch') {
        this.navigateToMatchDetails(result.match);
      } else if (result?.action === 'viewAll') {
        this.navigateToAllMatches(row);
      }
    });
    this.subscriptions.push(sub);
  }

  deleteScreening(row: ScreeningResponse): void {
    // Only remove from local history since no delete endpoint is provided
    const index = this.screeningHistory.indexOf(row);
    if (index > -1) {
      this.screeningHistory.splice(index, 1);
      this.totalElements = this.screeningHistory.length;
      // Update data source
      this.screeningDataSource = new MatTableDataSource(this.screeningHistory);
      this.screeningDataSource.paginator = this.paginator;
      this.screeningDataSource.sort = this.sort;
      this.snackbar.alertSuccess('Screening record removed');
    }
  }

  getStatusIcon(status: ScreeningStatus): string {
    switch (status) {
      case ScreeningStatus.COMPLETED:
        return 'check_circle';
      case ScreeningStatus.PARTIAL:
        return 'warning';
      case ScreeningStatus.FAILED:
        return 'error';
      case ScreeningStatus.PENDING:
        return 'schedule';
      default:
        return 'info';
    }
  }

  getStatusClass(status: ScreeningStatus): string {
    switch (status) {
      case ScreeningStatus.COMPLETED:
        return 'status-completed';
      case ScreeningStatus.PARTIAL:
        return 'status-partial';
      case ScreeningStatus.FAILED:
        return 'status-failed';
      case ScreeningStatus.PENDING:
        return 'status-pending';
      default:
        return 'status-unknown';
    }
  }

  formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString();
  }

  getSourceBadges(sources: string[]): string[] {
    return sources || [];
  }

  onTableAction(action: TableAction): void {
    if (action && typeof action === 'object') {
      // Try to access properties defensively
      const actionType = (action as any).action || (action as any).type;
      const row = (action as any).row || (action as any).data;
      
      switch (actionType) {
        case 'view':
          if (row) this.viewScreeningResult(row);
          break;
        case 'delete':
          if (row) this.deleteScreening(row);
          break;
        case 'export':
          if (row) this.exportScreeningResult(row);
          break;
        default:
          break;
      }
    }
  }

  onHeaderAction(action: HeaderAction): void {
    // HeaderAction might have different structure
    if (action && typeof action === 'object') {
      const actionType = (action as any).action || (action as any).type;
      
      switch (actionType) {
        case 'refresh':
          this.loadScreeningHistory();
          break;
        case 'screen':
          this.onScreen();
          break;
        default:
          break;
      }
    }
  }

  exportScreeningResult(row: ScreeningResponse): void {
    const data = JSON.stringify(row, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `screening_${row.searchedName}_${row.screeningId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    this.snackbar.alertSuccess('Screening result exported');
  }

  getSourcesForCategory(category: ScreeningCategory): SanctionListSource[] {
    switch (category) {
      case ScreeningCategory.PEP:
        return [SanctionListSource.PEP, SanctionListSource.OFAC_NS];
      case ScreeningCategory.SANCTIONS:
        return [SanctionListSource.OFAC_SDN, SanctionListSource.EU, SanctionListSource.UN, SanctionListSource.UK];
      case ScreeningCategory.CRIMINAL_WANTED:
        return [SanctionListSource.INTERPOL];
      case ScreeningCategory.CRYPTO:
        return [SanctionListSource.OFAC_SDN, SanctionListSource.OFAC_NS];
      case ScreeningCategory.INTERNAL:
        return [SanctionListSource.CUSTOM];
      default:
        return Object.values(SanctionListSource);
    }
  }

  getRiskLabel(risk: RiskLevel): string {
    const labels: Record<RiskLevel, string> = {
      [RiskLevel.HIGH]: 'High Risk',
      [RiskLevel.MEDIUM_HIGH]: 'Medium-High Risk',
      [RiskLevel.MEDIUM]: 'Medium Risk',
      [RiskLevel.LOW]: 'Low Risk'
    };
    return labels[risk] || risk;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    if (this.screeningDataSource) {
      this.screeningDataSource.filter = filterValue.trim().toLowerCase();
    }
  }

  hasActiveFilters(): boolean {
    const values = this.screeningForm.value;
    return !!(values.name ||  (values.sources && values.sources.length > 0) || 
      values.country ||  values.entityType ||  values.matchThreshold !== 80);
  }
}