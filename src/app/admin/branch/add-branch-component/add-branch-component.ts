import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BranchService, BranchResponse, CreateBranchRequest } from '../branch.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';

@Component({
  selector: 'app-add-branch',
  standalone: false,
  templateUrl: './add-branch-component.html',
  styleUrl: './add-branch-component.scss',
})
export class AddBranchComponent implements OnInit, OnDestroy {

  form!: FormGroup;
  isSubmitting = false;
  isEditMode   = false;
  editId: number | null = null;

  branchTypes = ['HEAD_OFFICE', 'REGIONAL', 'BRANCH', 'AGENCY', 'ATM'];
  statusOptions = ['ACTIVE', 'INACTIVE'];

  private subs: Subscription[] = [];

  constructor(
    private fb:      FormBuilder,
    private service: BranchService,
    private snack:   SnackbarService,
    private router:  Router,
    private route:   ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      branchCode:  ['', [Validators.required, Validators.minLength(2), Validators.maxLength(20)]],
      branchName:  ['', [Validators.required, Validators.minLength(2)]],
      branchType:  ['BRANCH'],
      region:      [''],
      address:     [''],
      status:      ['ACTIVE'],
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.isEditMode = true;
      this.editId     = id;
      this.loadBranch(id);
    }
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  private loadBranch(id: number): void {
    const s = this.service.getBranchById(id).subscribe({
      next: (b: BranchResponse) => {
        this.form.patchValue({
          branchCode: b.branchCode,
          branchName: b.branchName,
          branchType: b.branchType  || 'BRANCH',
          region:     b.region      || '',
          address:    b.address     || '',
          status:     b.status      || 'ACTIVE',
        });
        // Code cannot be changed during edit
        this.form.get('branchCode')!.disable();
      },
      error: err => {
        this.snack.alertError(err?.error?.message || 'Failed to load branch');
        this.router.navigate(['admin/user-management/branches']);
      },
    });
    this.subs.push(s);
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting) return;
    this.isSubmitting = true;

    const raw = this.form.getRawValue();
    const payload: CreateBranchRequest = {
      branchCode: raw.branchCode.trim().toUpperCase(),
      branchName: raw.branchName.trim(),
      branchType: raw.branchType  || undefined,
      region:     raw.region?.trim()  || undefined,
      address:    raw.address?.trim() || undefined,
      status:     raw.status          || 'ACTIVE',
    };

    const call$ = this.isEditMode && this.editId !== null
      ? this.service.updateBranch(this.editId, payload)
      : this.service.createBranch(payload);

    this.subs.push(
      call$.subscribe({
        next: () => {
          this.isSubmitting = false;
          this.snack.alertSuccess(
            this.isEditMode ? 'Branch updated successfully' : 'Branch created successfully'
          );
          this.router.navigate(['admin/user-management/branches']);
        },
        error: err => {
          this.isSubmitting = false;
          this.snack.alertError(err?.error?.message || 'Operation failed');
        },
      })
    );
  }

  cancel(): void {
    this.router.navigate(['admin/user-management/branches']);
  }

  err(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c.touched);
  }
}
