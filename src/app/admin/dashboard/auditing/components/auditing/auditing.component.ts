import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy } from "@angular/core";
import { AuditService } from "../../services/audit.service";
import { 
  AuditData, 
  getAllActions, 
  normalizeAuditDataArray, 
  getStatusClass, 
  getActionIcon 
} from "../../data/audit-data";
import { DatePipe } from "@angular/common";
import { MatPaginator } from "@angular/material/paginator";
import { UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatSort } from "@angular/material/sort";
import { SnackbarService } from "../../../../../shared/services/snackbar.service";
import { ViewAuditDetailsComponent } from "../view-audit-details/view-audit-details.component";
import { TokenStorageService } from "../../../../../core/service/token-storage.service";

@Component({
  selector: "app-auditing",
  templateUrl: "./auditing.component.html",
  styleUrls: ["./auditing.component.sass"],
  standalone: false,
})
export class AuditingComponent implements OnInit, OnDestroy {

  // ── Data ──────────────────────────────────────────────────────────────
  auditData: AuditData[] = [];
  loading = false;
  currentUserEmail: string = "";

  // ── Filters ───────────────────────────────────────────────────────────
  filterEmail = "";
  filterAction = "";
  filterEntityType = "";
  maxDate = new Date().toISOString().split("T")[0];

  // ── Filter Collapsible State ─────────────────────────────────────────
  filterCollapsed = false;
  private readonly FILTER_STATE_KEY = 'audit_filter_collapsed';

  // All available actions from the enhanced audit-data file
  allActions = getAllActions();

  dateForm = new UntypedFormGroup({
    date: new UntypedFormControl(new Date(), Validators.required),
  });

  // ── Pagination ────────────────────────────────────────────────────────
  totalRows = 0;
  pageSize = 10;
  currentPage = 0;
  page = 0;
  rowsPerPage = 10;
  rowsPerPageOptions = [10, 20, 50, 100];

  // ── Search mode ──────────────────────────────────────────────────────
  searchMode: 'user' | 'global' = 'user';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // ── Derived ───────────────────────────────────────────────────────────
  get startRecord(): number {
    return this.totalRows === 0 ? 0 : this.page * this.pageSize + 1;
  }
  get endRecord(): number {
    return Math.min((this.page + 1) * this.pageSize, this.totalRows);
  }
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalRows / this.pageSize));
  }

  constructor(
    private _auditService: AuditService,
    private _datePipe: DatePipe,
    private _tokenStorage: TokenStorageService,
    public dialog: MatDialog,
    private snackbar: SnackbarService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Get current user email
    const user = this._tokenStorage.getUser();
    this.currentUserEmail = user?.email || '';
    this.filterEmail = this.currentUserEmail;

    // Restore filter collapse state from localStorage
    const savedState = localStorage.getItem(this.FILTER_STATE_KEY);
    if (savedState !== null) {
      this.filterCollapsed = savedState === 'true';
    }

    this.setPageSize();
    window.addEventListener("resize", () => this.setPageSize());
    
    // Initial load - fetch user's audit logs
    this.fetchUserAudit();
  }

  ngOnDestroy(): void {
    // Save filter state to localStorage
    localStorage.setItem(this.FILTER_STATE_KEY, String(this.filterCollapsed));
  }

  setPageSize(): void {
    const h = window.innerHeight;
    this.pageSize = h > 1200 ? 20 : h > 900 ? 15 : 10;
    this.rowsPerPage = this.pageSize;
    this.currentPage = 0;
    this.page = 0;
  }

  /**
   * Toggle filter panel collapse state
   */
  toggleFilter(): void {
    this.filterCollapsed = !this.filterCollapsed;
    localStorage.setItem(this.FILTER_STATE_KEY, String(this.filterCollapsed));
  }

  /**
   * Check if any filters are active (excluding default values)
   */
  hasActiveFilters(): boolean {
    return !!(this.filterEmail && this.filterEmail !== this.currentUserEmail) ||
           !!this.filterAction ||
           !!this.filterEntityType;
  }

  /**
   * Get count of active filters
   */
  getActiveFilterCount(): number {
    let count = 0;
    if (this.filterEmail && this.filterEmail !== this.currentUserEmail) count++;
    if (this.filterAction) count++;
    if (this.filterEntityType) count++;
    return count;
  }

  /**
   * Get a summary of active filters for display when collapsed
   */
  getFilterSummary(): string {
    const parts: string[] = [];
    if (this.filterEmail && this.filterEmail !== this.currentUserEmail) {
      parts.push(`User: ${this.filterEmail}`);
    }
    if (this.filterAction) {
      const actionLabel = this.allActions.find(a => a.value === this.filterAction)?.label || this.filterAction;
      parts.push(`Action: ${actionLabel}`);
    }
    if (this.filterEntityType) {
      parts.push(`Entity: ${this.filterEntityType}`);
    }
    return parts.length > 0 ? parts.join(' • ') : 'No active filters';
  }

  // ── Fetch Methods ─────────────────────────────────────────────────────

  /**
   * Fetch audit logs for the current user using /user/{email} endpoint
   */
  fetchUserAudit(): void {
    if (!this.currentUserEmail) {
      this.snackbar.alertError("User email not found");
      return;
    }

    this.loading = true;
    this.searchMode = 'user';

    const sortBy = this.sort?.active || "timestamp";
    const direction = this.sort?.direction || "desc";

    this._auditService
      .findByUser(this.currentUserEmail, this.currentPage, this.pageSize, `${sortBy},${direction}`)
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          this.processResponse(res);
          this.cdr.detectChanges();
          this.snackbar.alertInfo(res.message);
        },
        error: (err: any) => {
          this.loading = false;
          this.cdr.detectChanges();
          this.snackbar.alertError(err?.error?.message || "Failed to fetch audit data");
        },
      });
  }

  /**
   * Search audit logs using /audit endpoint with filters
   */
  searchAudit(): void {
    this.loading = true;
    this.searchMode = 'global';

    const sortBy = this.sort?.active || "timestamp";
    const direction = this.sort?.direction || "desc";
    const dateStr = this._datePipe.transform(this.dateForm.value.date, "yyyy-MM-dd");

    let startDate = dateStr ? `${dateStr} 00:00:00` : undefined;
    let endDate = dateStr ? `${dateStr} 23:59:59` : undefined;

    this._auditService
      .search(
        this.filterEmail || undefined,
        this.filterAction || undefined,
        this.filterEntityType || undefined,
        startDate,
        endDate,
        this.currentPage,
        this.pageSize,
        `${sortBy},${direction}`
      )
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          this.processResponse(res);
          this.cdr.detectChanges();
          this.snackbar.alertInfo(res.message);
        },
        error: (err: any) => {
          this.loading = false;
          this.cdr.detectChanges();
          this.snackbar.alertError(err?.error?.message || "Failed to fetch audit data");
        },
      });
  }
  /**
   * Process the API response - uses the normalize function
   */
  private processResponse(res: any): void {
    const payload = res?.result ?? res;
    let rawData: any[] = [];

    if (payload?.data) {
      rawData = payload.data;
      this.totalRows = payload.totalItems ?? payload.totalElements ?? rawData.length;
      this.currentPage = payload.currentPage ?? this.currentPage;
      this.page = this.currentPage;
    } else if (payload?.content) {
      rawData = payload.content;
      this.totalRows = payload.totalElements ?? rawData.length;
    } else if (Array.isArray(payload)) {
      rawData = payload;
      this.totalRows = payload.length;
    } else {
      rawData = [];
      this.totalRows = 0;
    }

    this.auditData = normalizeAuditDataArray(rawData);
  }

  // ── UI Actions ────────────────────────────────────────────────────────

  /**
   * Switch to view current user's audit logs
   */
  viewMyAudit(): void {
    this.filterEmail = this.currentUserEmail;
    this.filterAction = '';
    this.filterEntityType = '';
    this.currentPage = 0;
    this.page = 0;
    this.fetchUserAudit();
  }

  /**
   * Search with current filters
   */
  applyFilters(): void {
    if (this.filterEmail === this.currentUserEmail && !this.filterAction && !this.filterEntityType) {
      this.fetchUserAudit();
    } else {
      this.searchAudit();
    }
  }

  resetFilters(): void {
    this.filterEmail = this.currentUserEmail;
    this.filterAction = '';
    this.filterEntityType = '';
    this.dateForm.patchValue({ date: new Date() });
    this.currentPage = 0;
    this.page = 0;
    this.fetchUserAudit();
  }

  // ── Pagination helpers ────────────────────────────────────────────────
  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.currentPage = this.page;
      this.applyFilters();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.currentPage = this.page;
      this.applyFilters();
    }
  }

  setRowsPerPage(value: number): void {
    if (this.pageSize === value) return;
    this.pageSize = value;
    this.rowsPerPage = value;
    this.currentPage = 0;
    this.page = 0;
    this.applyFilters();
  }

  getRowNumber(index: number): number {
    return index + 1 + this.page * this.pageSize;
  }

  // ── UI helpers (using imported functions) ────────────────────────────
  
  getStatusClass(status: string | boolean | undefined): string {
    return getStatusClass(status);
  }

  getEventIcon(action: string): string {
    return getActionIcon(action);
  }

  detailsCall(data: AuditData): void {
    this.dialog.open(ViewAuditDetailsComponent, {
      data: { record: data, action: "details" },
      width: "680px",
      panelClass: "audit-dialog-panel",
    });
  }
}