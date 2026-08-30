import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BranchService, BranchResponse } from '../branch.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';

@Component({
  selector: 'app-view-branch',
  standalone: false,
  templateUrl: './view-branch-component.html',
  styleUrl: './view-branch-component.scss',
})
export class ViewBranchComponent implements OnInit, OnDestroy {

  branch: BranchResponse | null = null;
  isLoading  = false;
  isChanging = false;

  private subs: Subscription[] = [];

  constructor(
    private route:   ActivatedRoute,
    private router:  Router,
    private service: BranchService,
    private snack:   SnackbarService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['admin/user-management/branches']); return; }
    this.loadBranch(id);
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  private loadBranch(id: number): void {
    this.isLoading = true;
    this.subs.push(
      this.service.getBranchById(id).subscribe({
        next: b  => { this.branch = b; this.isLoading = false; },
        error: err => {
          this.isLoading = false;
          this.snack.alertError(err?.error?.message || 'Failed to load branch');
          this.router.navigate(['admin/user-management/branches']);
        },
      })
    );
  }

  changeStatus(status: string): void {
    if (!this.branch || this.isChanging) return;
    this.isChanging = true;
    this.subs.push(
      this.service.changeBranchStatus(this.branch.id, status).subscribe({
        next: updated => {
          this.branch    = updated;
          this.isChanging = false;
          this.snack.alertSuccess(
            `Branch ${status === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`
          );
        },
        error: err => {
          this.isChanging = false;
          this.snack.alertError(err?.error?.message || 'Failed to update status');
        },
      })
    );
  }

  editBranch(): void {
    this.router.navigate(['admin/user-management/branches/edit', this.branch?.id]);
  }

  back(): void {
    this.router.navigate(['admin/user-management/branches']);
  }

  get isActive(): boolean {
    return (this.branch?.status || '').toUpperCase() === 'ACTIVE';
  }
}
