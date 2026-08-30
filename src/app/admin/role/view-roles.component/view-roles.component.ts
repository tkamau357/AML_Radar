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
    if (!id) { this.router.navigate(['/admin/user-management/roles']); return; }
    this.loadRole(id);
    this.loadPermissions(id);
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  private loadRole(id: number): void {
    this.isLoading = true;
    const s = this.roles.getRoleById(id).subscribe({
      next: r => { this.role = r; this.isLoading = false; },
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
      error: () => { this.isLoadingPerms = false; },
    });
    this.subs.push(s);
  }

  private buildGroups(perms: PermissionResponse[]): void {
    const map = new Map<string, PermissionResponse[]>();
    perms.forEach(p => {
      const cat = p.method?.toUpperCase() || 'General';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(p);
    });
    this.groupedPermissions = Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, ps]) => ({ category, perms: ps }));
  }

  editRole(): void {
    this.router.navigate(['/admin/user-management/roles/edit', this.role?.id]);
  }

  back(): void {
    this.router.navigate(['/admin/user-management/roles']);
  }
}
