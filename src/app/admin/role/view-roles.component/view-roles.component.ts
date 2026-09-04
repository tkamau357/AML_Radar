import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RolesService, RoleResponse, PermissionResponse } from '../roles.service';
import { NotificationToastService } from '../../../data/services/notification-toast.service';

@Component({
  selector: 'app-view-roles',
  standalone: false,
  templateUrl: './view-roles.component.html',
  styleUrl: './view-roles.component.scss',
})
export class ViewRolesComponent implements OnInit, OnDestroy {

  role: RoleResponse | null = null;
  permissions: PermissionResponse[] = [];
  groupedPermissions: { category: string; perms: PermissionResponse[] }[] = [];

  isLoading = false;

  collapsedGroups = new Set<string>();
  private subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roles: RolesService,
    private snack: NotificationToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || isNaN(id)) {
      this.router.navigate(['/admin/role-management/roles']);
      return;
    }
    this.loadRole(id);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  private loadRole(id: number): void {
    this.isLoading = true;
    const s = this.roles.getRoleById(id).subscribe({
      next: r => {
        this.role = r;
        this.permissions = this.toPermissionResponses(r.permissions);
        this.buildGroups(this.permissions);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.snack.alertError(err?.error?.message || 'Failed to load role');
        this.router.navigate(['/admin/role-management/roles']);
      },
    });
    this.subs.push(s);
  }

  private toPermissionResponses(permissions: any[] | undefined): PermissionResponse[] {
    return (permissions || []).map(permission => {
      const code = typeof permission === 'string'
        ? permission
        : permission?.code || permission?.name || permission?.permission || permission?.permissionCode || permission?.key || '';

      return typeof permission === 'object' && permission !== null
        ? { ...permission, code: String(code) }
        : {
            code: String(code),
            name: this.formatPermissionName(String(code)),
            endpoint: '',
            method: '',
            branchScoped: false,
          };
    }).filter(permission => !!permission.code);
  }

  /**
   * Format permission code into a readable name
   * Example: "user:create" → "User Create"
   */
  private formatPermissionName(code: string): string {
    return code
      .split(':')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private buildGroups(perms: PermissionResponse[]): void {
    const map = new Map<string, PermissionResponse[]>();

    perms.forEach(p => {
      let category = p.method?.toUpperCase() || 'General';

      if (!p.method && p.code) {
        const parts = p.code.split(':');
        if (parts.length > 1) {
          category = parts[0].toUpperCase();
        }
      }

      if (!map.has(category)) map.set(category, []);
      map.get(category)!.push(p);
    });

    this.groupedPermissions = Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, ps]) => ({
        category,
        perms: ps.sort((a, b) => (a.name || a.code).localeCompare(b.name || b.code))
      }));
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
    return this.groupedPermissions.length > 0 &&
      this.groupedPermissions.every(group => this.collapsedGroups.has(group.category));
  }

  editRole(): void {
    if (this.role?.id) {
      this.router.navigate(['/admin/role-management/roles/edit', this.role.id]);
    }
  }

  back(): void {
    this.router.navigate(['/admin/role-management/roles']);
  }
}