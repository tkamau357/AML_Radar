import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RolesService, RoleResponse, PermissionResponse } from '../roles.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';

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

  isLoading     = false;
  isLoadingPerms = false;

  private subs: Subscription[] = [];

  constructor(
    private route:  ActivatedRoute,
    private router: Router,
    private roles:  RolesService,
    private snack:  SnackbarService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { 
      this.router.navigate(['/admin/user-management/roles']); 
      return; 
    }
    this.loadRole(id);
    this.loadPermissions(id);
  }

  ngOnDestroy(): void { 
    this.subs.forEach(s => s.unsubscribe()); 
  }

  private loadRole(id: number): void {
    this.isLoading = true;
    const s = this.roles.getRoleById(id).subscribe({
      next: r => { 
        this.role = r; 
        this.isLoading = false; 
      },
      error: err => {
        this.isLoading = false;
        this.snack.alertError(err?.error?.message || 'Failed to load role');
        this.router.navigate(['/admin/user-management/roles']);
      },
    });
    this.subs.push(s);
  }

  private loadPermissions(roleId: number): void {
    this.isLoadingPerms = true;
    const s = this.roles.getRolePermissions(roleId).subscribe({
      next: perms => {
        this.permissions = perms;
        this.buildGroups(perms);
        this.isLoadingPerms = false;
      },
      error: (err) => { 
        this.isLoadingPerms = false;
        // If permissions API fails, try using permissions from role object
        if (this.role?.permissions) {
          const permObjects = this.role.permissions.map(code => ({
            code: code,
            name: this.formatPermissionName(code),
            endpoint: '',
            method: '',
            branchScoped: false
          }));
          this.permissions = permObjects;
          this.buildGroups(permObjects);
        }
      },
    });
    this.subs.push(s);
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
      // Try to get category from method or code prefix
      let cat = p.method?.toUpperCase() || 'General';
      
      // If no method, try to extract from code
      if (!p.method && p.code) {
        const parts = p.code.split(':');
        if (parts.length > 1) {
          cat = parts[0].toUpperCase();
        }
      }
      
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(p);
    });
    
    this.groupedPermissions = Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, ps]) => ({ 
        category, 
        perms: ps.sort((a, b) => (a.name || a.code).localeCompare(b.name || b.code))
      }));
  }

  collapsedGroups = new Set<string>();

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

  editRole(): void {
    this.router.navigate(['/admin/user-management/roles/edit', this.role?.id]);
  }

  back(): void {
    this.router.navigate(['/admin/user-management/roles']);
  }
}