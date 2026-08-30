import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UsersService, UserResponse } from '../users.service';
import { SnackbarService } from '../../../shared/services/snackbar.service';

@Component({
  selector: 'app-view-users',
  standalone: false,
  templateUrl: './view-users.component.html',
  styleUrl: './view-users.component.scss',
})
export class ViewUsersComponent implements OnInit, OnDestroy {

  user: UserResponse | null = null;
  isLoading   = false;
  isChanging  = false;

  private subs: Subscription[] = [];

  constructor(
    private route:  ActivatedRoute,
    private router: Router,
    private users:  UsersService,
    private snack:  SnackbarService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['/admin/user-management/users']); return; }
    this.loadUser(id);
  }

  ngOnDestroy(): void { this.subs.forEach(s => s.unsubscribe()); }

  private loadUser(id: number): void {
    this.isLoading = true;
    this.subs.push(
      this.users.getUserById(id).subscribe({
        next: u  => { this.user = u; this.isLoading = false; },
        error: err => {
          this.isLoading = false;
          this.snack.alertError(err?.error?.message || 'Failed to load user');
          this.router.navigate(['/admin/user-management/users']);
        },
      })
    );
  }

  changeStatus(status: string): void {
    if (!this.user || this.isChanging) return;
    this.isChanging = true;
    this.subs.push(
      this.users.changeUserStatus(this.user.id, status).subscribe({
        next: updated => {
          this.user      = updated;
          this.isChanging = false;
          this.snack.alertSuccess(`User ${status === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`);
        },
        error: err => {
          this.isChanging = false;
          this.snack.alertError(err?.error?.message || 'Failed to update status');
        },
      })
    );
  }

  editUser(): void {
    this.router.navigate(['/admin/user-management/users/edit', this.user?.id]);
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
