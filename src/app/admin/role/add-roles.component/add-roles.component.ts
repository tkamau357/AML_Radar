import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RolesService, PermissionResponse, RoleResponse } from '../roles.service';
import { NotificationToastService } from '../../../data/services/notification-toast.service';

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

  // Maps normalized key (e.g. "user_list") → original name from the API (e.g. "USER_LIST")
  // Used to build the correct payload on submit.
  private permNameMap = new Map<string, string>();

  isLoading = false;
  isSubmitting = false;
  isEditMode = false;
  roleId: number | null = null;

  private subs: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private rolesService: RolesService,
    private snack: NotificationToastService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
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

    const sub = this.rolesService.getRoleById(id).subscribe({
      next: role => {
        // Autofill role details
        this.form.patchValue({
          name: role.name || '',
          description: role.description || '',
        });

        // Load all available permissions, passing the role to pre-select
        this.loadAllPermissions(role);
      },
      error: err => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.snack.alertError(err?.error?.message || 'Failed to load role');
        this.router.navigate(['/admin/role-management/roles']);
      },
    });

    this.subs.push(sub);
  }

  // ─────────────────────────────────────────────────────────────
  // Load all available permissions
  // ─────────────────────────────────────────────────────────────
  private loadAllPermissions(role?: RoleResponse): void {
    const sub = this.rolesService.getAllPermissions().subscribe({
      next: perms => {
        this.allPermissions = perms;

        // Build the normalized-key → original-name lookup
        this.permNameMap.clear();
        perms.forEach(p => {
          this.permNameMap.set(this.permissionCode(p), p.name);
        });

        this.buildGroups(perms);

        // If editing, select the permissions already assigned to the role
        if (role && role.permissions) {
          this.setSelectedPermissions(role.permissions, perms);
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.snack.alertError(err?.error?.message || 'Failed to load permissions');
      },
    });

    this.subs.push(sub);
  }

  // ─────────────────────────────────────────────────────────────
  // Set permissions assigned to the existing role.
  //
  // The role endpoint returns permissions as colon-separated strings
  // e.g. "user:list", "role:update", "dashboard:view".
  // The all-permissions endpoint returns objects whose .name is
  // underscore-separated e.g. "USER_LIST", "ROLE_UPDATE".
  //
  // We normalize both to lowercase-underscore ("user_list") for
  // comparison, then store that same key in selectedPermissions so
  // the [checked] bindings match.
  // ─────────────────────────────────────────────────────────────
  private setSelectedPermissions(rolePermissions: any[], allPerms: PermissionResponse[]): void {
    this.selectedPermissions.clear();

    // Build a lookup: normalizedKey → canonical key stored in the set
    const permKeyMap = new Map<string, string>();
    allPerms.forEach(p => {
      const canonical = this.permissionCode(p);           // e.g. "user_list"
      const normalized = this.normalizeKey(p.name || p.code);  // same thing
      permKeyMap.set(normalized, canonical);
    });

    rolePermissions.forEach(rp => {
      const normalized = this.normalizeKey(
        typeof rp === 'string' ? rp : (rp?.code || rp?.name || '')
      );
      const canonical = permKeyMap.get(normalized);
      if (canonical) {
        this.selectedPermissions.add(canonical);
      }
    });
  }

  /**
   * Normalizes any permission identifier to lowercase-underscore.
   *  "user:list"   → "user_list"
   *  "USER_LIST"   → "user_list"
   *  "dashboard:view" → "dashboard_view"
   */
  private normalizeKey(value: string): string {
    return String(value).trim().toLowerCase().replace(/[:\-\s]+/g, '_');
  }

  /**
   * Returns the canonical key used in selectedPermissions for a given
   * PermissionResponse. Uses the name field (lowercased + underscored).
   */
  permissionCode(permission: any): string {
    const raw = typeof permission === 'string'
      ? permission
      : (permission?.name || permission?.code || '');
    return this.normalizeKey(raw);
  }

  // ─────────────────────────────────────────────────────────────
  // Build permission groups by domain prefix
  // ─────────────────────────────────────────────────────────────
  private buildGroups(perms: PermissionResponse[]): void {
    const map = new Map<string, PermissionResponse[]>();

    perms.forEach(p => {
      let category = 'General';
      const identifier = p.name || p.code;

      if (identifier) {
        const upper = identifier.trim().toUpperCase();
        if (upper.includes('_')) {
          category = upper.split('_')[0];
        } else if (upper.includes(':')) {
          category = upper.split(':')[0];
        } else {
          category = upper;
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
        perms: ps.sort((a, b) => (a.name || a.code).localeCompare(b.name || b.code)),
      }));
  }

  // ─────────────────────────────────────────────────────────────
  // Permission toggle methods
  // ─────────────────────────────────────────────────────────────
  togglePermission(name: string): void {
    const normalizedName = name.trim();
    if (this.selectedPermissions.has(normalizedName)) {
      this.selectedPermissions.delete(normalizedName);
    } else {
      this.selectedPermissions.add(normalizedName);
    }
  }

  toggleGroup(perms: PermissionResponse[]): void {
    const allSelected = perms.every(p => this.selectedPermissions.has(this.permissionCode(p)));
    
    perms.forEach(p => {
      const name = this.permissionCode(p);
      if (allSelected) {
        this.selectedPermissions.delete(name);
      } else {
        this.selectedPermissions.add(name);
      }
    });
  }

  isGroupSelected(perms: PermissionResponse[]): boolean {
    return perms.length > 0 && perms.every(p => this.selectedPermissions.has(this.permissionCode(p)));
  }

  isGroupIndeterminate(perms: PermissionResponse[]): boolean {
    const count = perms.filter(p => this.selectedPermissions.has(this.permissionCode(p))).length;
    return count > 0 && count < perms.length;
  }

  get selectedCount(): number {
    return this.selectedPermissions.size;
  }

  get allPermissionsSelected(): boolean {
    return this.allPermissions.length > 0 &&
      this.allPermissions.every(p => this.selectedPermissions.has(this.permissionCode(p.name)));
  }

  get somePermissionsSelected(): boolean {
    return this.selectedPermissions.size > 0 &&
      this.selectedPermissions.size < this.allPermissions.length;
  }

  toggleAllPermissions(): void {
    if (this.allPermissionsSelected) {
      // Deselect all
      this.selectedPermissions.clear();
    } else {
      // Select all
      this.allPermissions.forEach(p => {
        this.selectedPermissions.add(this.permissionCode(p.name));
      });
    }
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

    // Resolve normalized keys back to the original permission names from the API
    // e.g. "user_list" → "USER_LIST" (or whatever the all-permissions API returned)
    const permissions = Array.from(this.selectedPermissions)
      .map(key => this.permNameMap.get(key) ?? key)
      .filter(Boolean);

    const payload = {
      name: this.form.value.name.trim(),
      description: this.form.value.description?.trim() || '',
      permissions,
    };

    if (this.isEditMode && this.roleId) {
      const sub = this.rolesService.updateRole(this.roleId, payload).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
          this.snack.alertSuccess('Role updated successfully');
          this.router.navigate(['/admin/role-management/roles']);
        },
        error: err => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
          this.snack.alertError(err?.error?.message || 'Failed to update role');
        },
      });
      this.subs.push(sub);
    } else {
      const sub = this.rolesService.createRole(payload).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
          this.snack.alertSuccess('Role created successfully');
          this.router.navigate(['/admin/role-management/roles']);
        },
        error: err => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
          this.snack.alertError(err?.error?.message || 'Failed to create role');
        },
      });
      this.subs.push(sub);
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/role-management/roles']);
  }
}