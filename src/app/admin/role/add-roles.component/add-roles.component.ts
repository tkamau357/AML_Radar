import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RolesService, PermissionResponse } from '../roles.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';

@Component({
  selector: 'app-add-roles',
  standalone: false,
  templateUrl: './add-roles.component.html',
  styleUrl: './add-roles.component.scss',
})
export class AddRolesComponent implements OnInit, OnDestroy {

  form!: FormGroup;

  allPermissions: PermissionResponse[] = [];

  groupedPermissions: {
    category: string;
    perms: PermissionResponse[];
  }[] = [];

  selectedPermissions = new Set<string>();
  collapsedGroups = new Set<string>();

  isLoading = false;
  isSubmitting = false;

  // True when editing an existing role
  isEditMode = false;

  // ID of the role being edited
  roleId: number | null = null;

  private subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private roles: RolesService,
    private snack: SnackbarService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
    });

    // Check whether an ID exists in the route.
    // Example:
    // /admin/user-management/roles/edit/5
    this.roleId = Number(this.route.snapshot.paramMap.get('id'));

    if (this.roleId && !isNaN(this.roleId)) {
      this.isEditMode = true;
      this.loadRole(this.roleId);
    } else {
      this.loadPermissions();
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  // ─────────────────────────────────────────────────────────────
  // Load role for edit
  // ─────────────────────────────────────────────────────────────
  private loadRole(id: number): void {
    this.isLoading = true;

    const sub = this.roles.getRoleById(id).subscribe({
      next: role => {

        // Autofill role details
        this.form.patchValue({
          name: role.name || '',
          description: role.description || '',
        });

        // Load all available permissions first
        this.loadPermissions(role);

      },

      error: err => {
        this.isLoading = false;

        this.snack.alertError(
          err?.error?.message || 'Failed to load role'
        );

        this.router.navigate(['/admin/user-management/roles']);
      },
    });

    this.subs.push(sub);
  }

  // ─────────────────────────────────────────────────────────────
  // Load available permissions
  // ─────────────────────────────────────────────────────────────
  private loadPermissions(role?: any): void {
    const sub = this.roles.getAllPermissions().subscribe({
      next: perms => {

        this.allPermissions = perms;

        this.buildGroups(perms);

        // If editing, select the permissions already assigned
        // to this role.
        if (role) {
          this.setSelectedPermissions(role);
        }

        this.isLoading = false;
      },

      error: () => {
        this.isLoading = false;

        // The role details have already been loaded, so
        // permission loading failure should not prevent editing.
      },
    });

    this.subs.push(sub);
  }

  // ─────────────────────────────────────────────────────────────
  // Set permissions assigned to the existing role
  // ─────────────────────────────────────────────────────────────
  private setSelectedPermissions(role: any): void {
    this.selectedPermissions.clear();

    if (!role.permissions) {
      return;
    }

    role.permissions.forEach((permission: any) => {
      const code =
        typeof permission === 'string'
          ? permission
          : permission.code;

      if (code) {
        this.selectedPermissions.add(code);
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Build permission groups
  // ─────────────────────────────────────────────────────────────
  private buildGroups(perms: PermissionResponse[]): void {
    const map = new Map<string, PermissionResponse[]>();

    perms.forEach(p => {
      const cat = this.categoryFrom(p);

      if (!map.has(cat)) {
        map.set(cat, []);
      }

      map.get(cat)!.push(p);
    });

    this.groupedPermissions = Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, ps]) => ({
        category,
        perms: ps,
      }));
  }

  private categoryFrom(p: PermissionResponse): string {
    if (p.method) {
      return p.method.toUpperCase();
    }

    const parts = (p.name || p.code || '').split('_');

    return parts.length > 1
      ? parts.slice(0, -1).join(' ')
      : 'General';
  }

  // ─────────────────────────────────────────────────────────────
  // Permission toggle
  // ─────────────────────────────────────────────────────────────
  togglePermission(code: string): void {
    if (this.selectedPermissions.has(code)) {
      this.selectedPermissions.delete(code);
    } else {
      this.selectedPermissions.add(code);
    }
  }

  toggleGroup(perms: PermissionResponse[]): void {
    const allSelected = perms.every(
      p => this.selectedPermissions.has(p.code)
    );

    perms.forEach(p =>
      allSelected
        ? this.selectedPermissions.delete(p.code)
        : this.selectedPermissions.add(p.code)
    );
  }

  isGroupSelected(perms: PermissionResponse[]): boolean {
    return (
      perms.length > 0 &&
      perms.every(p => this.selectedPermissions.has(p.code))
    );
  }

  isGroupIndeterminate(perms: PermissionResponse[]): boolean {
    const count = perms.filter(
      p => this.selectedPermissions.has(p.code)
    ).length;

    return count > 0 && count < perms.length;
  }

  get selectedCount(): number {
    return this.selectedPermissions.size;
  }

  toggleGroupCollapse(category: string): void {
    if (this.collapsedGroups.has(category)) {
      this.collapsedGroups.delete(category);
    } else {
      this.collapsedGroups.add(category);
    }
  }

  isGroupCollapsed(category: string): boolean {
    return this.collapsedGroups.has(category);
  }

  toggleAllGroups(): void {
    const allCollapsed = this.groupedPermissions.every(
      group => this.collapsedGroups.has(group.category)
    );

    if (allCollapsed) {
      this.collapsedGroups.clear();
    } else {
      this.collapsedGroups = new Set(
        this.groupedPermissions.map(group => group.category)
      );
    }
  }

  get allGroupsCollapsed(): boolean {
    return (
      this.groupedPermissions.length > 0 &&
      this.groupedPermissions.every(
        group => this.collapsedGroups.has(group.category)
      )
    );
  }

  // ─────────────────────────────────────────────────────────────
  // Submit
  // ─────────────────────────────────────────────────────────────
  submit(): void {
    if (this.form.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    const payload = {
      name: this.form.value.name.trim(),
      description: this.form.value.description?.trim() || null,
      permissions: Array.from(this.selectedPermissions),
    };

    // EDIT
    if (this.isEditMode && this.roleId) {

      const sub = this.roles.updateRole(this.roleId, payload).subscribe({
        next: () => {
          this.isSubmitting = false;

          this.snack.alertSuccess(
            'Role updated successfully'
          );

          this.router.navigate([
            '/admin/user-management/roles'
          ]);
        },

        error: err => {
          this.isSubmitting = false;

          this.snack.alertError(
            err?.error?.message || 'Failed to update role'
          );
        },
      });

      this.subs.push(sub);
      return;
    }

    // CREATE
    const sub = this.roles.createRole(payload).subscribe({
      next: () => {
        this.isSubmitting = false;

        this.snack.alertSuccess(
          'Role created successfully'
        );

        this.router.navigate([
          '/admin/user-management/roles'
        ]);
      },

      error: err => {
        this.isSubmitting = false;

        this.snack.alertError(
          err?.error?.message || 'Failed to create role'
        );
      },
    });

    this.subs.push(sub);
  }

  cancel(): void {
    this.router.navigate([
      '/admin/user-management/roles'
    ]);
  }
}