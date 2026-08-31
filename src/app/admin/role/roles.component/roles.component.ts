import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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

  // Pagination
  totalElements = 0;
  pageIndex = 0;
  pageSize = 20;

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
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadRoles(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    const sub = this.rolesService.getAllRoles({ page: this.pageIndex, size: this.pageSize }).subscribe({
      next: (response) => {
        this.roles = response.content;
        this.totalElements = response.totalElements;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.snackbar.alertError(err?.error?.message || 'Failed to load roles');
      },
    });
    this.subs.push(sub);
  }

  onPaginationChange(event: { pageNumber: number; pageSize: number }): void {
    this.pageIndex = event.pageNumber;
    this.pageSize = event.pageSize;
    this.loadRoles();
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
