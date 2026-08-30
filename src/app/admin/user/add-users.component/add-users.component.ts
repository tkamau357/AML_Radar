import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UsersService } from '../users.service';
import { RolesService, RoleResponse } from '../../role/roles.service';
import { BranchService, BranchResponse } from '../../branch/branch.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';

@Component({
  selector: 'app-add-users',
  standalone: false,
  templateUrl: './add-users.component.html',
  styleUrl: './add-users.component.scss',
})
export class AddUsersComponent implements OnInit, OnDestroy {

  form!: FormGroup;
  roles:    RoleResponse[]    = [];
  branches: BranchResponse[]  = [];

  isLoadingRefs = false;
  isSubmitting  = false;
  showPassword  = false;

  private subs: Subscription[] = [];

  constructor(
    private fb:      FormBuilder,
    private users:   UsersService,
    private rolesSvc: RolesService,
    private branches$: BranchService,
    private snack:   SnackbarService,
    private router:  Router,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      firstName:   ['', [Validators.required]],
      lastName:    ['', [Validators.required]],
      email:       ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      roleId:      [null, [Validators.required]],
      branchCode:  [null, [Validators.required]],
      password:    ['', [Validators.required, Validators.minLength(8)]],
    });
    this.loadReferenceData();
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  private loadReferenceData(): void {
    this.isLoadingRefs = true;
    let done = 0;
    const check = () => { if (++done === 2) this.isLoadingRefs = false; };

    this.subs.push(
      this.rolesSvc.getAllRoles().subscribe({ next: r => { this.roles = r; check(); }, error: () => check() }),
      this.branches$.getAllBranches().subscribe({ next: b => { this.branches = b; check(); }, error: () => check() }),
    );
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting) return;
    this.isSubmitting = true;

    const v = this.form.value;
    const payload = {
      firstName:   v.firstName.trim(),
      lastName:    v.lastName.trim(),
      email:       v.email.trim().toLowerCase(),
      phoneNumber: v.phoneNumber?.trim() || null,
      roleId:      v.roleId,
      branchCode:  v.branchCode,
      password:    v.password,
    };

    this.subs.push(
      this.users.createUser(payload).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.snack.alertSuccess('User created successfully');
          this.router.navigate(['/admin/user-management/users']);
        },
        error: err => {
          this.isSubmitting = false;
          this.snack.alertError(err?.error?.message || 'Failed to create user');
        },
      })
    );
  }

  cancel(): void { this.router.navigate(['/admin/user-management/users']); }

  err(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c.touched);
  }
}
