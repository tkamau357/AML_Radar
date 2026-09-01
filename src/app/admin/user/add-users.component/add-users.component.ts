import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, forkJoin } from 'rxjs';
import { UsersService, UserResponse, CreateUserRequest, UpdateUserRequest } from '../users.service';
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
  roles: RoleResponse[] = [];
  branches: BranchResponse[] = [];

  isLoadingRefs = false;
  isSubmitting = false;
  isEditMode = false;
  editId: number | null = null;
  showPassword = false;

  private subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private users: UsersService,
    private rolesSvc: RolesService,
    private branchSvc: BranchService,
    private snack: SnackbarService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      roleId: [null, [Validators.required]],
      branchCode: [null, [Validators.required]],
      password: ['', [Validators.minLength(8)]],
    });

    // Load reference data first
    this.loadReferenceData();

    // Check if editing
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.editId = Number(idParam);
      if (!isNaN(this.editId)) {
        this.isEditMode = true;
        // Password is optional on edit
        this.form.get('password')?.clearValidators();
        this.form.get('password')?.updateValueAndValidity();
        // Load user data after refs are loaded
        this.loadUser(this.editId);
      }
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  private loadReferenceData(): void {
    this.isLoadingRefs = true;
    
    const roles$ = this.rolesSvc.getAllRolesList();
    const branches$ = this.branchSvc.getAllBranchesList();

    const sub = forkJoin([roles$, branches$]).subscribe({
      next: ([roles, branches]) => {
        this.roles = roles;
        this.branches = branches;
        this.isLoadingRefs = false;
      },
      error: (err) => {
        this.isLoadingRefs = false;
        this.snack.alertError('Failed to load reference data');
      },
    });
    this.subs.push(sub);
  }

  private loadUser(id: number): void {
    // Wait for refs to load first
    const checkRefs = setInterval(() => {
      if (!this.isLoadingRefs && this.roles.length > 0 && this.branches.length > 0) {
        clearInterval(checkRefs);
        this.loadUserData(id);
      }
    }, 100);

    // Timeout after 10 seconds
    setTimeout(() => clearInterval(checkRefs), 10000);
  }

  private loadUserData(id: number): void {
    const sub = this.users.getUserById(id).subscribe({
      next: (user: UserResponse) => {
        this.form.patchValue({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          roleId: user.role?.id || null,
          branchCode: user.branch?.branchCode || null,
        });
        // Disable email on edit (primary key)
        this.form.get('email')?.disable();
      },
      error: (err) => {
        this.snack.alertError(err?.error?.message || 'Failed to load user');
        this.router.navigate(['/admin/user-management/users']);
      },
    });
    this.subs.push(sub);
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting) return;
    this.isSubmitting = true;

    const v = this.form.getRawValue();
    
    if (this.isEditMode && this.editId) {
      // UPDATE
      const payload: UpdateUserRequest = {
        firstName: v.firstName.trim(),
        lastName: v.lastName.trim(),
        branchCode: v.branchCode,
        roleId: v.roleId,
      };

      const sub = this.users.updateUser(this.editId, payload).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.snack.alertSuccess('User updated successfully');
          this.router.navigate(['/admin/user-management/users']);
        },
        error: err => {
          this.isSubmitting = false;
          this.snack.alertError(err?.error?.message || 'Failed to update user');
        },
      });
      this.subs.push(sub);
    } else {
      // CREATE
      const payload: CreateUserRequest = {
        firstName: v.firstName.trim(),
        lastName: v.lastName.trim(),
        email: v.email.trim().toLowerCase(),
        roleId: v.roleId,
        branchCode: v.branchCode,
        password: v.password,
      };

      const sub = this.users.createUser(payload).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.snack.alertSuccess('User created successfully');
          this.router.navigate(['/admin/user-management/users']);
        },
        error: err => {
          this.isSubmitting = false;
          this.snack.alertError(err?.error?.message || 'Failed to create user');
        },
      });
      this.subs.push(sub);
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/user-management/users']);
  }

  err(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c.touched);
  }
}