import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BranchService, BranchResponse } from '../branch.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { TableAction, HeaderAction } from '../../../shared/components/dynamic-tables/dynamic-tables.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmationDialog } from '../../../shared/components/delete-confirmation-dialog/delete-confirmation-dialog';

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
  pageSize = 10;

  columns = [
    { label: '#',            field: 'index'                        },
    { label: 'Branch Code',  field: 'branchCode'                   },
    { label: 'Branch Name',  field: 'branchName'                   },
    { label: 'Status',       field: 'status',    type: 'badge'     },
    { label: 'Created',      field: 'createdAt', type: 'date'      },
  ];

  actions: TableAction<BranchResponse>[] = [
    {
      label: 'View',
      icon: 'visibility',
      onClick: (row: BranchResponse) => this.viewBranch(row),
    },
    {
      label: 'Edit',
      icon: 'edit',
      onClick: (row: BranchResponse) => this.editBranch(row),
    },
    {
      label: 'Delete',
      icon: 'delete',
      onClick: (row: BranchResponse) => this.deleteBranch(row),
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
    private dialog: MatDialog,
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
    const sub = this.branchService.getAllBranches({ page: this.pageIndex, size: this.pageSize }).subscribe({
      next: (response) => {
        this.branches = response?.content || [];
        this.totalElements = response?.totalElements || 0;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
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
    this.router.navigate(['/admin/configurations/branches/add']);
  }

  viewBranch(branch: BranchResponse): void {
    this.router.navigate(['/admin/configurations/branches/view', branch.branchCode]);
  }

  editBranch(branch: BranchResponse): void {
    this.router.navigate(['/admin/configurations/branches/edit', branch.branchCode]);
  }

  deleteBranch(branch: BranchResponse): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialog, {
      width: '460px',
      maxWidth: 'calc(100vw - 32px)',
      data: {
        title: 'Delete Branch',
        message: `Are you sure you want to delete the branch "${branch.branchName}"? This action cannot be undone.`,
        confirmText: 'Delete Branch',
        cancelText: 'Cancel',
      },
    });

    const sub = dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.isLoading = true;
      const deleteSub = this.branchService.deleteBranchByCode(branch.branchCode).subscribe({
        next: () => {
          this.snackbar.alertSuccess('Branch deleted successfully');
          this.loadBranches();
        },
        error: (err: any) => {
          this.isLoading = false;
          this.snackbar.alertError(err?.error?.message || 'Failed to delete branch');
        },
      });
      this.subs.push(deleteSub);
    });
    this.subs.push(sub);
  }
}