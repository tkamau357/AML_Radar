// view-branch-component.ts
import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
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
  isLoading = false;

  private subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: BranchService,
    private snack: SnackbarService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('code');
    if (!code) {
      this.router.navigate(['admin/configurations/branches']);
      return;
    }
    this.loadBranch(code);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  private loadBranch(code: string): void {
    this.isLoading = true;
    const sub = this.service.getBranchByCode(code).subscribe({
      next: b => {
        this.branch = b;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.snack.alertError(err?.error?.message || 'Failed to load branch');
        this.router.navigate(['admin/configurations/branches']);
      },
    });
    this.subs.push(sub);
  }

  editBranch(): void {
    if (this.branch?.branchCode) {
      this.router.navigate(['admin/configurations/branches/edit', this.branch.branchCode]);
    }
  }

  back(): void {
    this.router.navigate(['admin/configurations/branches']);
  }

  get isActive(): boolean {
    return (this.branch?.status || '').toUpperCase() === 'ACTIVE';
  }
}