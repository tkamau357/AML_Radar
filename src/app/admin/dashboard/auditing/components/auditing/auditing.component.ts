import { Component, OnInit, ViewChild } from "@angular/core";
import { AuditService } from "../../services/audit.service";
import { AuditData } from "../../data/audit-data";
import { DatePipe } from "@angular/common";
import { MatPaginator } from "@angular/material/paginator";
import { UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatSort } from "@angular/material/sort";
import { SnackbarService } from "../../../../../shared/services/snackbar.service";
import { ViewAuditDetailsComponent } from "../view-audit-details/view-audit-details.component";
import { pastDateOnly } from "../../../../../Validators/date-validators";

@Component({
  selector: "app-auditing",
  templateUrl: "./auditing.component.html",
  styleUrls: ["./auditing.component.sass"],
  standalone: false,
})
export class AuditingComponent implements OnInit {

  // ── Data ──────────────────────────────────────────────────────────────
  auditData: AuditData[] = [];
  loading = false;

  // ── Filters ───────────────────────────────────────────────────────────
  filterEmail    = "";
  filterEventType = "";
  readonly pastDateOnly = pastDateOnly;
  maxDate = new Date().toISOString().split("T")[0];

  dateForm = new UntypedFormGroup({
    date: new UntypedFormControl(new Date(), Validators.required),
  });

  // ── Pagination ────────────────────────────────────────────────────────
  totalRows     = 0;
  pageSize      = 10;
  currentPage   = 0;
  page          = 0;
  rowsPerPage   = 10;
  rowsPerPageOptions = [10, 20, 50, 100];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort)      sort!: MatSort;

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
    public  dialog: MatDialog,
    private snackbar: SnackbarService,
  ) {}

  ngOnInit(): void {
    this.setPageSize();
    window.addEventListener("resize", () => this.setPageSize());
    this.fetchByDate();
  }

  setPageSize(): void {
    const h = window.innerHeight;
    this.pageSize = h > 1200 ? 20 : h > 900 ? 15 : 10;
    this.rowsPerPage = this.pageSize;
    this.currentPage = 0;
    this.page = 0;
  }

  // ── Fetch ─────────────────────────────────────────────────────────────
  fetchByDate(): void {
    if (this.dateForm.invalid) return;

    this.loading = true;

    const dateStr = this._datePipe.transform(this.dateForm.value.date, "yyyy/MM/dd");
    if (!dateStr) {
      this.loading = false;
      this.snackbar.alertError("Invalid date selected");
      return;
    }

    // Sort from ViewChild (may be undefined on first load)
    const sortBy    = this.sort?.active    || "timestamp";
    const direction = this.sort?.direction || "desc";

    this._auditService
      .getAllByDate(dateStr, this.currentPage, this.pageSize, sortBy, direction)
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          // Support both paged-response envelope and plain array
          if (res?.result?.data) {
            this.auditData  = this._normalise(res.result.data);
            this.totalRows  = res.result.totalItems ?? res.result.totalElements ?? this.auditData.length;
            this.currentPage = res.result.currentPage ?? this.currentPage;
            this.page       = this.currentPage;
          } else if (res?.content) {
            // Spring Page envelope
            this.auditData  = this._normalise(res.content);
            this.totalRows  = res.totalElements ?? this.auditData.length;
          } else if (Array.isArray(res)) {
            this.auditData  = this._normalise(res);
            this.totalRows  = res.length;
          } else {
            this.auditData  = [];
            this.totalRows  = 0;
          }

          if (this.auditData.length === 0) {
            this.snackbar.alertInfo("No records found for the selected date");
          }
        },
        error: (err: any) => {
          this.loading = false;
          this.snackbar.alertError(err?.error?.message || "Failed to fetch audit data");
        },
      });
  }

  private _normalise(data: any[]): AuditData[] {
    return data.map((item: any) => ({
      ...item,
      timestamp: item.timestamp ? new Date(item.timestamp) : null,
    }));
  }

  resetFilters(): void {
    this.filterEmail     = "";
    this.filterEventType = "";
    this.dateForm.patchValue({ date: new Date() });
    this.currentPage = 0;
    this.page        = 0;
    this.fetchByDate();
  }

  // ── Pagination helpers ────────────────────────────────────────────────
  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.currentPage = this.page;
      this.fetchByDate();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.currentPage = this.page;
      this.fetchByDate();
    }
  }

  setRowsPerPage(value: number): void {
    if (this.pageSize === value) return;
    this.pageSize    = value;
    this.rowsPerPage = value;
    this.currentPage = 0;
    this.page        = 0;
    this.fetchByDate();
  }

  getRowNumber(index: number): number {
    return index + 1 + this.page * this.pageSize;
  }

  // ── UI helpers ────────────────────────────────────────────────────────
  getStatusClass(status: string): string {
    switch ((status || "").toUpperCase()) {
      case "SUCCESS":  return "badge-success";
      case "FAILED":
      case "FAILURE":  return "badge-failed";
      case "PENDING":  return "badge-pending";
      default:         return "badge-default";
    }
  }

  getEventIcon(event: string): string {
    const map: Record<string, string> = {
      UPDATE:  "edit",
      CREATE:  "add_circle_outline",
      DELETE:  "delete_outline",
      LOGIN:   "login",
      LOGOUT:  "logout",
      READ:    "visibility",
    };
    return map[(event || "").toUpperCase()] || "event_note";
  }

  detailsCall(data: any): void {
    this.dialog.open(ViewAuditDetailsComponent, {
      data:  { record: data, action: "details" },
      width: "680px",
      panelClass: "audit-dialog-panel",
    });
  }
}
