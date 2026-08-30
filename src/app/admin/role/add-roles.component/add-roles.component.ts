import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
  // grouped: { category: string; perms: PermissionResponse[] }[]
  groupedPermissions: { category: string; perms: PermissionResponse[] }[] = [];
  selectedPermissions = new Set<string>();

  isLoading    = false;
  isSubmitting = false;

  private subs: Subscription[] = [];

  constructor(
    private fb:      FormBuilder,
    private roles:   RolesService,
    private snack:   SnackbarService,
    private router:  Router,
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name:        ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
    });
    this.loadPermissions();
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  // ── Load available permissions ───────────────────────────────────────
  private loadPermissions(): void {
    this.isLoading = true;
    // Roles endpoint: GET /roles/{id}/permissions — we use a generic
    // permissions list if the backend exposes one, otherwise fall back
    // to fetching from an existing system role (id=1 or similar).
    // Here we call getRolePermissions(1) as a bootstrap; adapt as needed.
    const s = this.roles.getRolePermissions(1).subscribe({
      next: perms => {
        this.allPermissions = perms;
        this.buildGroups(perms);
        this.isLoading = false;
      },
      error: () => {
        // Non-fatal — form still usable without pre-loaded permissions
        this.isLoading = false;
      },
    });
    this.subs.push(s);
  }

  private buildGroups(perms: PermissionResponse[]): void {
    const map = new Map<string, PermissionResponse[]>();
    perms.forEach(p => {
      const cat = this.categoryFrom(p);
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(p);
    });
    this.groupedPermissions = Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, ps]) => ({ category, perms: ps }));
  }

  private categoryFrom(p: PermissionResponse): string {
    // Derive category from method or a naming convention
    if (p.method)  return p.method.toUpperCase();
    const parts = (p.name || p.code || '').split('_');
    return parts.length > 1 ? parts.slice(0, -1).join(' ') : 'General';
  }

  // ── Permission toggle ────────────────────────────────────────────────
  togglePermission(code: string): void {
    if (this.selectedPermissions.has(code)) {
      this.selectedPermissions.delete(code);
    } else {
      this.selectedPermissions.add(code);
    }
  }

  toggleGroup(perms: PermissionResponse[]): void {
    const allSelected = perms.every(p => this.selectedPermissions.has(p.code));
    perms.forEach(p => allSelected
      ? this.selectedPermissions.delete(p.code)
      : this.selectedPermissions.add(p.code));
  }

  isGroupSelected(perms: PermissionResponse[]): boolean {
    return perms.length > 0 && perms.every(p => this.selectedPermissions.has(p.code));
  }

  isGroupIndeterminate(perms: PermissionResponse[]): boolean {
    const count = perms.filter(p => this.selectedPermissions.has(p.code)).length;
    return count > 0 && count < perms.length;
  }

  get selectedCount(): number { return this.selectedPermissions.size; }

  // ── Submit ───────────────────────────────────────────────────────────
  submit(): void {
    if (this.form.invalid || this.isSubmitting) return;
    this.isSubmitting = true;

    const payload = {
      name:        this.form.value.name.trim(),
      description: this.form.value.description?.trim() || null,
      permissions: Array.from(this.selectedPermissions),
    };

    const s = this.roles.createRole(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.snack.alertSuccess('Role created successfully');
        this.router.navigate(['/admin/user-management/roles']);
      },
      error: err => {
        this.isSubmitting = false;
        this.snack.alertError(err?.error?.message || 'Failed to create role');
      },
    });
    this.subs.push(s);
  }

  cancel(): void {
    this.router.navigate(['/admin/user-management/roles']);
  }
}
