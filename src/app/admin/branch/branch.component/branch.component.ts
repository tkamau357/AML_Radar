import { Component, OnInit, OnDestroy } from '@angular/core';
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
  ) {}

  ngOnInit(): void {
    this.loadBranches();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadBranches(): void {
    this.isLoading = true;
    const sub = this.branchService.getAllBranches().subscribe({
      next: (branches: BranchResponse[]) => {
        this.branches = branches;
        this.isLoading = false;
      },
      error: (err: any) => {
        this.isLoading = false;
        this.snackbar.alertError(err?.error?.message || 'Failed to load branches');
      },
    });
    this.subs.push(sub);
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

  deleteBranch(branch: BranchResponse): void {
    if (!confirm(`Delete branch "${branch.branchName}"? This cannot be undone.`)) return;

    const sub = this.branchService.deleteBranchByCode(branch.branchCode).subscribe({
      next: () => {
        this.snackbar.alertSuccess('Branch deleted successfully');
        this.loadBranches();
      },
      error: (err: any) => {
        this.snackbar.alertError(err?.error?.message || 'Failed to delete branch');
      },
    });
    this.subs.push(sub);
  }
}