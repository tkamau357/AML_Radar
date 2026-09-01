import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RolesService, PermissionResponse, RoleResponse } from '../roles.service';
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
  groupedPermissions: { category: string; perms: PermissionResponse[] }[] = [];
  selectedPermissions = new Set<string>();
  collapsedGroups = new Set<string>();

  isLoading = false;
  isSubmitting = false;
  isEditMode = false;
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
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      description: [''],
    });

    // Check if editing
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.roleId = Number(idParam);
      if (!isNaN(this.roleId)) {
        this.isEditMode = true;
        this.loadRole(this.roleId);
        return;
      }
    }
    
    // Create mode - load all permissions
    this.loadAllPermissions();
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

        // Load all available permissions
        this.loadAllPermissions(role);
      },
      error: err => {
        this.isLoading = false;
        this.snack.alertError(err?.error?.message || 'Failed to load role');
        this.router.navigate(['/admin/user-management/roles']);
      },
    });

    this.subs.push(sub);
  }

  // ─────────────────────────────────────────────────────────────
  // Load all available permissions
  // ─────────────────────────────────────────────────────────────
  private loadAllPermissions(role?: RoleResponse): void {
    const sub = this.roles.getAllPermissions().subscribe({
      next: perms => {
        this.allPermissions = perms;
        this.buildGroups(perms);

        // If editing, select the permissions already assigned
        if (role && role.permissions) {
          this.setSelectedPermissions(role.permissions);
        }

        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.snack.alertError(err?.error?.message || 'Failed to load permissions');
      },
    });

    this.subs.push(sub);
  }

  // ─────────────────────────────────────────────────────────────
  // Set permissions assigned to the existing role
  // ─────────────────────────────────────────────────────────────
  private setSelectedPermissions(permissions: any[]): void {
  this.selectedPermissions.clear();
  permissions.forEach(perm => {
    // Handle both string and object formats
    const permName = typeof perm === 'string' ? perm : (perm.code || perm.name);
    if (permName) {
      this.selectedPermissions.add(permName);
    }
  });
}

  // ─────────────────────────────────────────────────────────────
  // Build permission groups
  // ─────────────────────────────────────────────────────────────
  private buildGroups(perms: PermissionResponse[]): void {
    const map = new Map<string, PermissionResponse[]>();

    perms.forEach(p => {
      // Group by method (GET, POST, PUT, DELETE)
      let category = p.method?.toUpperCase() || 'General';
      
      // If no method, try to extract from code
      if (!p.method && p.code) {
        const parts = p.code.split(':');
        if (parts.length > 1) {
          category = parts[0].toUpperCase();
        }
      }
      
      if (!map.has(category)) {
        map.set(category, []);
      }
      map.get(category)!.push(p);
    });

    this.groupedPermissions = Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, ps]) => ({
        category,
        perms: ps.sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }

  // ─────────────────────────────────────────────────────────────
  // Permission toggle methods
  // ─────────────────────────────────────────────────────────────
  togglePermission(code: string): void {
    if (this.selectedPermissions.has(code)) {
      this.selectedPermissions.delete(code);
    } else {
      this.selectedPermissions.add(code);
    }
  }

  toggleGroup(perms: PermissionResponse[]): void {
    const allSelected = perms.every(p => this.selectedPermissions.has(p.code));
    perms.forEach(p =>
      allSelected
        ? this.selectedPermissions.delete(p.code)
        : this.selectedPermissions.add(p.code)
    );
  }

  isGroupSelected(perms: PermissionResponse[]): boolean {
    return perms.length > 0 && perms.every(p => this.selectedPermissions.has(p.code));
  }

  isGroupIndeterminate(perms: PermissionResponse[]): boolean {
    const count = perms.filter(p => this.selectedPermissions.has(p.code)).length;
    return count > 0 && count < perms.length;
  }

  get selectedCount(): number {
    return this.selectedPermissions.size;
  }

  // ─────────────────────────────────────────────────────────────
  // Collapse/Expand methods
  // ─────────────────────────────────────────────────────────────
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
    return this.groupedPermissions.length > 0 &&
      this.groupedPermissions.every(group => this.collapsedGroups.has(group.category));
  }

  // ─────────────────────────────────────────────────────────────
  // Submit
  // ─────────────────────────────────────────────────────────────
  submit(): void {
  if (this.form.invalid || this.isSubmitting) {
    return;
  }

  this.isSubmitting = true;

  // ✅ FIX: Send permissions as an array of strings, not objects
  const payload = {
    name: this.form.value.name.trim(),
    description: this.form.value.description?.trim() || '',
    permissions: Array.from(this.selectedPermissions)  // ✅ Simply convert Set to array of strings
  };

  if (this.isEditMode && this.roleId) {
    // EDIT
    const sub = this.roles.updateRole(this.roleId, payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.snack.alertSuccess('Role updated successfully');
        this.router.navigate(['/admin/user-management/roles']);
      },
      error: err => {
        this.isSubmitting = false;
        this.snack.alertError(err?.error?.message || 'Failed to update role');
      },
    });
    this.subs.push(sub);
  } else {
    // CREATE
    const sub = this.roles.createRole(payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.snack.alertSuccess('Role created successfully');
        this.router.navigate(['/admin/user-management/roles']);
      },
      error: err => {
        this.isSubmitting = false;
        this.snack.alertError(err?.error?.message || 'Failed to create role');
      },
    });
    this.subs.push(sub);
  }
}

  cancel(): void {
    this.router.navigate(['/admin/user-management/roles']);
  }
}