import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UsersService, UserResponse } from '../users.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { TableAction, HeaderAction } from '../../../shared/components/dynamic-tables/dynamic-tables.component';

@Component({
  selector: 'app-users',
  standalone: false,
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit, OnDestroy {
  users: UserResponse[] = [];
  isLoading = false;

  columns = [
    { label: '#',            field: 'index'                                              },
    { label: 'First Name',   field: 'firstName'                                          },
    { label: 'Last Name',    field: 'lastName'                                           },
    { label: 'Email',        field: 'email'                                              },
    { label: 'Phone',        field: 'phoneNumber'                                        },
    { label: 'Branch',       field: 'branchName',
      formatter: (row: UserResponse) => row.branch?.branchName ?? '—'                    },
    { label: 'Role',         field: 'roleName',
      formatter: (row: UserResponse) => row.role?.name ?? '—'                            },
    { label: 'Status',       field: 'status',       type: 'badge'                        },
    { label: 'Last Login',   field: 'lastLoginAt',  type: 'date'                        },
  ];

  actions: TableAction<UserResponse>[] = [
    {
      label: 'View',
      icon: 'visibility',
      onClick: (row) => this.viewUser(row),
    },
    {
      label: 'Edit',
      icon: 'edit',
      onClick: (row) => this.editUser(row),
    },
    {
      label: 'Activate',
      icon: 'check_circle',
      show: (row) => row.status?.toUpperCase() !== 'ACTIVE',
      onClick: (row) => this.changeStatus(row, 'ACTIVE'),
    },
    {
      label: 'Deactivate',
      icon: 'block',
      show: (row) => row.status?.toUpperCase() === 'ACTIVE',
      onClick: (row) => this.changeStatus(row, 'INACTIVE'),
    },
    {
      label: 'Delete',
      icon: 'delete',
      onClick: (row) => this.deleteUser(row),
    },
  ];

  headerActions: HeaderAction[] = [
    {
      icon: 'refresh',
      tooltip: 'Refresh',
      onClick: () => this.loadUsers(),
    },
  ];

  private subs: Subscription[] = [];

  constructor(
    private usersService: UsersService,
    private snackbar: SnackbarService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadUsers(): void {
    this.isLoading = true;
    const sub = this.usersService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.snackbar.alertError(err?.error?.message || 'Failed to load users');
      },
    });
    this.subs.push(sub);
  }

  onAdd(): void {
    this.router.navigate(['admin/user-management/users/add']);
  }

  viewUser(user: UserResponse): void {
    this.router.navigate(['admin/user-management/users/view', user.id]);
  }

  editUser(user: UserResponse): void {
    this.router.navigate(['admin/user-management/users/edit', user.id]);
  }

  changeStatus(user: UserResponse, status: string): void {
    const sub = this.usersService.changeUserStatus(user.id, status).subscribe({
      next: () => {
        this.snackbar.alertSuccess(`User ${status === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`);
        this.loadUsers();
      },
      error: (err) => {
        this.snackbar.alertError(err?.error?.message || 'Failed to update user status');
      },
    });
    this.subs.push(sub);
  }

  deleteUser(user: UserResponse): void {
    if (!confirm(`Delete user "${user.firstName} ${user.lastName}"? This cannot be undone.`)) return;

    const sub = this.usersService.deleteUser(user.id).subscribe({
      next: () => {
        this.snackbar.alertSuccess('User deleted successfully');
        this.loadUsers();
      },
      error: (err) => {
        this.snackbar.alertError(err?.error?.message || 'Failed to delete user');
      },
    });
    this.subs.push(sub);
  }
}
