import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UsersService, UserResponse } from '../users.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-view-users',
  standalone: false,
  templateUrl: './view-users.component.html',
  styleUrl: './view-users.component.scss',
})
export class ViewUsersComponent implements OnInit, OnDestroy {

  user: UserResponse | null = null;
  isLoading = false;
  isChanging = false;

  private subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private users: UsersService,
    private snack: SnackbarService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/admin/user-management/users']);
      return;
    }
    const id = Number(idParam);
    if (isNaN(id)) {
      this.router.navigate(['/admin/user-management/users']);
      return;
    }
    this.loadUser(id);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  private loadUser(id: number): void {
    this.isLoading = true;
    const sub = this.users.getUserById(id).subscribe({
      next: u => {
        this.user = u;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.snack.alertError(err?.error?.message || 'Failed to load user');
        this.router.navigate(['/admin/user-management/users']);
      },
    });
    this.subs.push(sub);
  }

  changeStatus(status: string): void {
    if (!this.user || this.isChanging) return;

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '460px',
      maxWidth: 'calc(100vw - 32px)',
      data: {
        title: status === 'ACTIVE' ? 'Activate User' : 'Deactivate User',
        message: status === 'ACTIVE'
          ? `Are you sure you want to activate "${this.user.firstName} ${this.user.lastName}"?`
          : `Are you sure you want to deactivate "${this.user.firstName} ${this.user.lastName}"? The user will not be able to log in.`,
        confirmText: status === 'ACTIVE' ? 'Activate' : 'Deactivate',
        cancelText: 'Cancel',
      },
    });

    const sub = dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.isChanging = true;
      const statusSub = this.users.changeUserStatus(this.user!.id, status).subscribe({
        next: updated => {
          this.user = updated;
          this.isChanging = false;
          this.cdr.detectChanges();
          this.snack.alertSuccess(`User ${status === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`);
        },
        error: err => {
          this.isChanging = false;
          this.cdr.detectChanges();
          this.snack.alertError(err?.error?.message || 'Failed to update status');
        },
      });
      this.subs.push(statusSub);
    });
    this.subs.push(sub);
  }

  editUser(): void {
    if (this.user?.id) {
      this.router.navigate(['/admin/user-management/users/edit', this.user.id]);
    }
  }

  back(): void {
    this.router.navigate(['/admin/user-management/users']);
  }

  get statusLabel(): string {
    return (this.user?.status || '').toUpperCase();
  }

  get isActive(): boolean {
    return this.statusLabel === 'ACTIVE';
  }
}