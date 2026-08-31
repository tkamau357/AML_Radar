import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BranchService, BranchResponse } from '../branch.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { TableAction, HeaderAction } from '../../../shared/components/dynamic-tables/dynamic-tables.component';

@Component({
  selector: 'app-branch',
  standalone: false,
  templateUrl: './branch.component.html',
  styleUrl: './branch.component.scss',
})
export class BranchComponent implements OnInit, OnDestroy {
  branches: BranchResponse[] = [];
  isLoading = false;

  // Pagination
  totalElements = 0;
  pageIndex = 0;
  pageSize = 20;

  columns = [
    { label: '#',            field: 'index'                        },
    { label: 'Branch Code',  field: 'branchCode'                   },
    { label: 'Branch Name',  field: 'branchName'                   },
    { label: 'Type',         field: 'branchType'                   },
    { label: 'Region',       field: 'region'                       },
    { label: 'Address',      field: 'address'                      },
    { label: 'Status',       field: 'status',    type: 'badge'     },
    { label: 'Created',      field: 'createdAt', type: 'date'      },
  ];

  actions: TableAction<BranchResponse>[] = [
    {
      label: 'View',
      icon: 'visibility',
      onClick: (row) => this.viewBranch(row),
    },
    {
      label: 'Edit',
      icon: 'edit',
      onClick: (row) => this.editBranch(row),
    },
    {
      label: 'Activate',
      icon: 'check_circle',
      show: (row) => row.status?.toUpperCase() !== 'ACTIVE',
      onClick: (row) => this.changeStatus(row, 'ACTIVE'),
    },
    {
      label: 'Deactivate',
      icon: 'block',
      show: (row) => row.status?.toUpperCase() === 'ACTIVE',
      onClick: (row) => this.changeStatus(row, 'INACTIVE'),
    },
    {
      label: 'Delete',
      icon: 'delete',
      onClick: (row) => this.deleteBranch(row),
    },
  ];

  headerActions: HeaderAction[] = [
    {
      icon: 'refresh',
      tooltip: 'Refresh',
      onClick: () => this.loadBranches(),
    },
  ];

  private subs: Subscription[] = [];

  constructor(
    private branchService: BranchService,
    private snackbar: SnackbarService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadBranches();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadBranches(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    const sub = this.branchService.getAllBranches({ page: this.pageIndex, size: this.pageSize }).subscribe({
      next: (response) => {
        this.branches = response.content;
        this.totalElements = response.totalElements;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.snackbar.alertError(err?.error?.message || 'Failed to load branches');
      },
    });
    this.subs.push(sub);
  }

  onPaginationChange(event: { pageNumber: number; pageSize: number }): void {
    this.pageIndex = event.pageNumber;
    this.pageSize = event.pageSize;
    this.loadBranches();
  }

  onAdd(): void {
    this.router.navigate(['/admin/user-management/branches/add']);
  }

  viewBranch(branch: BranchResponse): void {
    this.router.navigate(['/admin/user-management/branches/view', branch.id]);
  }

  editBranch(branch: BranchResponse): void {
    this.router.navigate(['/admin/user-management/branches/edit', branch.id]);
  }

  changeStatus(branch: BranchResponse, status: string): void {
    const sub = this.branchService.changeBranchStatus(branch.id, status).subscribe({
      next: () => {
        this.snackbar.alertSuccess(`Branch ${status === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`);
        this.loadBranches();
      },
      error: (err) => {
        this.snackbar.alertError(err?.error?.message || 'Failed to update branch status');
      },
    });
    this.subs.push(sub);
  }

  deleteBranch(branch: BranchResponse): void {
    if (!confirm(`Delete branch "${branch.branchName}"? This cannot be undone.`)) return;

    const sub = this.branchService.deleteBranch(branch.id).subscribe({
      next: () => {
        this.snackbar.alertSuccess('Branch deleted successfully');
        this.loadBranches();
      },
      error: (err) => {
        this.snackbar.alertError(err?.error?.message || 'Failed to delete branch');
      },
    });
    this.subs.push(sub);
  }
}
