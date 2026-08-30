import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RolesService, RoleResponse } from '../roles.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { TableAction, HeaderAction } from '../../../shared/components/dynamic-tables/dynamic-tables.component';

@Component({
  selector: 'app-roles',
  standalone: false,
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss',
})
export class RolesComponent implements OnInit, OnDestroy {
  roles: RoleResponse[] = [];
  isLoading = false;

  columns = [
    { label: '#',          field: 'index',       type: 'index'  },
    { label: 'Role Name',  field: 'name'                        },
    { label: 'Description',field: 'description'                 },
    { label: 'System Role',field: 'isSystemRole', type: 'badge' },
    { label: 'Created',    field: 'createdAt',    type: 'date'  },
  ];

  actions: TableAction<RoleResponse>[] = [
    {
      label: 'View',
      icon: 'visibility',
      onClick: (row) => this.viewRole(row),
    },
    {
      label: 'Edit',
      icon: 'edit',
      show: (row) => !row.isSystemRole,
      onClick: (row) => this.editRole(row),
    },
    {
      label: 'Delete',
      icon: 'delete',
      show: (row) => !row.isSystemRole,
      onClick: (row) => this.deleteRole(row),
    },
  ];

  headerActions: HeaderAction[] = [
    {
      icon: 'refresh',
      tooltip: 'Refresh',
      onClick: () => this.loadRoles(),
    },
  ];

  private subs: Subscription[] = [];

  constructor(
    private rolesService: RolesService,
    private snackbar: SnackbarService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadRoles(): void {
    this.isLoading = true;
    const sub = this.rolesService.getAllRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.snackbar.alertError(err?.error?.message || 'Failed to load roles');
      },
    });
    this.subs.push(sub);
  }

  onAdd(): void {
    this.router.navigate(['admin/user-management/roles/add']);
  }

  viewRole(role: RoleResponse): void {
    this.router.navigate(['admin/user-management/roles/view', role.id]);
  }

  editRole(role: RoleResponse): void {
    this.router.navigate(['admin/user-management/roles/edit', role.id]);
  }

  deleteRole(role: RoleResponse): void {
    if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;

    const sub = this.rolesService.deleteRole(role.id).subscribe({
      next: () => {
        this.snackbar.alertSuccess('Role deleted successfully');
        this.loadRoles();
      },
      error: (err) => {
        this.snackbar.alertError(err?.error?.message || 'Failed to delete role');
      },
    });
    this.subs.push(sub);
  }
}
