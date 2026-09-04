import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
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
  isLoading = false;
  isChanging = false;

  private subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private users: UsersService,
    private snack: SnackbarService,
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