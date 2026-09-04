import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UsersService, UserResponse } from '../users.service';
import { TableAction, HeaderAction } from '../../../shared/components/dynamic-tables/dynamic-tables.component';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { DeleteConfirmationDialog } from '../../../shared/components/delete-confirmation-dialog/delete-confirmation-dialog';
import { NotificationToastService } from '../../../data/services/notification-toast.service';

@Component({
  selector: 'app-users',
  standalone: false,
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit, OnDestroy {
  users: UserResponse[] = [];
  isLoading = false;

  totalElements = 0;
  pageIndex = 0;
  pageSize = 10;

  columns = [
    { label: '#',            field: 'index' },
    { label: 'First Name',   field: 'firstName' },
    { label: 'Last Name',    field: 'lastName' },
    { label: 'Email',        field: 'email' },
    { label: 'Branch',       field: 'branchName' },
    { label: 'Role',         field: 'roleName' },
    { label: 'Status',       field: 'status', type: 'badge' },
    { label: 'Last Login',   field: 'lastLoginAt', type: 'date' },
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
      label: 'Reset Password',
      icon: 'vpn_key',
      onClick: (row) => this.forceResetPassword(row),
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
    private snackbar: NotificationToastService,
    private router: Router,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadUsers(): void {
    this.isLoading = true;
    const sub = this.usersService.getAllUsers({ page: this.pageIndex, size: this.pageSize }).subscribe({
      next: (response) => {
        const rawData = response?.content || [];
        this.totalElements = response?.totalElements || 0;

        this.users = rawData.map((item: any) => ({
          ...item,
          roleName: item.role?.name ?? "N/A",
          branchName: item.branch?.branchName ?? "N/A",
        }));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges();
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
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '460px',
      maxWidth: 'calc(100vw - 32px)',
      data: {
        title: status === 'ACTIVE' ? 'Activate User' : 'Deactivate User',
        message: status === 'ACTIVE' 
          ? `Are you sure you want to activate "${user.firstName} ${user.lastName}"?`
          : `Are you sure you want to deactivate "${user.firstName} ${user.lastName}"? The user will not be able to log in.`,
        confirmText: status === 'ACTIVE' ? 'Activate' : 'Deactivate',
        cancelText: 'Cancel',
      },
    });

    const sub = dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.isLoading = true;
      const statusSub = this.usersService.changeUserStatus(user.id, status).subscribe({
        next: (updated) => {
          this.snackbar.alertSuccess(`User ${status === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`);
          this.loadUsers();
        },
        error: (err) => {
          this.isLoading = false;
          this.snackbar.alertError(err?.error?.message || 'Failed to update user status');
        },
      });
      this.subs.push(statusSub);
    });
    this.subs.push(sub);
  }

  deleteUser(user: UserResponse): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialog, {
      width: '460px',
      maxWidth: 'calc(100vw - 32px)',
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete the user "${user.firstName} ${user.lastName}"? This action cannot be undone.`,
        confirmText: 'Delete User',
        cancelText: 'Cancel',
      },
    });

    const sub = dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.isLoading = true;
      const deleteSub = this.usersService.deleteUser(user.id).subscribe({
        next: () => {
          this.snackbar.alertSuccess('User deleted successfully');
          this.loadUsers();
        },
        error: (err) => {
          this.isLoading = false;
          this.snackbar.alertError(err?.error?.message || 'Failed to delete user');
        },
      });
      this.subs.push(deleteSub);
    });
    this.subs.push(sub);
  }

  forceResetPassword(user: UserResponse): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '460px',
      maxWidth: 'calc(100vw - 32px)',
      data: {
        title: 'Reset User Password',
        message: `Are you sure you want to reset the password for "${user.firstName} ${user.lastName}"? A new temporary password will be generated and sent to their email (${user.email}).`,
        confirmText: 'Reset Password',
        cancelText: 'Cancel',
      },
    });

    const sub = dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.isLoading = true;
      const resetSub = this.usersService.forceResetPassword(user.id).subscribe({
        next: () => {
          this.snackbar.alertSuccess('Password reset successfully. New credentials sent to user\'s email.');
          this.loadUsers();
        },
        error: (err) => {
          this.isLoading = false;
          this.snackbar.alertError(err?.error?.message || 'Failed to reset password');
        },
      });
      this.subs.push(resetSub);
    });
    this.subs.push(sub);
  }

  onPaginationChange(event: { pageNumber: number; pageSize: number }): void {
    this.pageIndex = event.pageNumber;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }
}