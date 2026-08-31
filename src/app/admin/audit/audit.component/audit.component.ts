import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuditService, AuditResponse, AuditAction } from '../audit.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { HeaderAction } from '../../../shared/components/dynamic-tables/dynamic-tables.component';

@Component({
  selector: 'app-audit',
  standalone: false,
  templateUrl: './audit.component.html',
  styleUrl: './audit.component.scss',
})
export class AuditComponent implements OnInit, OnDestroy {
  audits: AuditResponse[] = [];
  isLoading = false;

  // Pagination
  totalElements = 0;
  pageIndex = 0;
  pageSize = 20;

  // Filters
  userEmailFilter = '';
  actionFilter: AuditAction | '' = '';
  entityTypeFilter = '';
  startDateFilter = '';
  endDateFilter = '';

  columns = [
    { label: '#',           field: 'index'                                                },
    { label: 'Action',      field: 'action',      type: 'badge'                           },
    { label: 'User',        field: 'userEmail'                                            },
    { label: 'Branch',      field: 'userBranchCode'                                       },
    { label: 'Entity Type', field: 'entityType'                                           },
    { label: 'Entity ID',   field: 'entityId'                                             },
    { label: 'Details',     field: 'details'                                              },
    { label: 'IP Address',  field: 'ipAddress'                                            },
    { label: 'Status',      field: 'success',
      formatter: (row: AuditResponse) => row.success ? 'Success' : 'Failed',
      type: 'badge'                                                                       },
    { label: 'Timestamp',   field: 'timestamp',   type: 'date'                            },
  ];

  actions = []; // Audit logs are read-only

  headerActions: HeaderAction[] = [
    {
      icon: 'refresh',
      tooltip: 'Refresh',
      onClick: () => this.loadAudits(),
    },
  ];

  actionOptions: { value: AuditAction | ''; label: string }[] = [
    { value: '', label: 'All Actions' },
    { value: 'LOGIN_SUCCESS', label: 'Login Success' },
    { value: 'LOGIN_FAILED', label: 'Login Failed' },
    { value: 'LOGOUT', label: 'Logout' },
    { value: 'USER_CREATED', label: 'User Created' },
    { value: 'USER_UPDATED', label: 'User Updated' },
    { value: 'USER_DELETED', label: 'User Deleted' },
    { value: 'ROLE_CREATED', label: 'Role Created' },
    { value: 'ROLE_UPDATED', label: 'Role Updated' },
    { value: 'BRANCH_CREATED', label: 'Branch Created' },
    { value: 'SANCTION_SCREENED', label: 'Sanction Screened' },
    { value: 'SANCTION_LIST_SYNCED', label: 'Sanction List Synced' },
    { value: 'DATA_EXPORTED', label: 'Data Exported' },
  ];

  private subs: Subscription[] = [];

  constructor(
    private auditService: AuditService,
    private snackbar: SnackbarService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadAudits();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadAudits(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    const params: any = {
      page: this.pageIndex,
      size: this.pageSize,
    };
    
    if (this.userEmailFilter) {
      params.userEmail = this.userEmailFilter;
    }
    if (this.actionFilter) {
      params.action = this.actionFilter;
    }
    if (this.entityTypeFilter) {
      params.entityType = this.entityTypeFilter;
    }
    if (this.startDateFilter) {
      params.startDate = this.formatDateForApi(this.startDateFilter);
    }
    if (this.endDateFilter) {
      params.endDate = this.formatDateForApi(this.endDateFilter);
    }

    const sub = this.auditService.search(params).subscribe({
      next: (response) => {
        this.audits = response.content;
        this.totalElements = response.totalElements;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.snackbar.alertError(err?.error?.message || 'Failed to load audit logs');
      },
    });
    this.subs.push(sub);
  }

  private formatDateForApi(date: string): string {
    // Input: "2026-08-31" or "2026-08-31T00:00"
    // Output: "2026-08-31 00:00:00"
    if (!date) return '';
    
    if (date.includes('T')) {
      return date.replace('T', ' ') + ':00';
    }
    return date + ' 00:00:00';
  }

  onPaginationChange(event: { pageNumber: number; pageSize: number }): void {
    this.pageIndex = event.pageNumber;
    this.pageSize = event.pageSize;
    this.loadAudits();
  }

  onSearch(): void {
    this.pageIndex = 0;
    this.loadAudits();
  }

  clearFilters(): void {
    this.userEmailFilter = '';
    this.actionFilter = '';
    this.entityTypeFilter = '';
    this.startDateFilter = '';
    this.endDateFilter = '';
    this.pageIndex = 0;
    this.loadAudits();
  }
}
