import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/service/auth.service';
import { TokenStorageService } from '../../core/service/token-storage.service';
import { SnackbarService } from '../../shared/services/snackbar.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css'],
  standalone: false
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
  changePasswordForm!: FormGroup;
  loading = false;
  error = '';
  
  hideCurrentPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;

  userEmail = '';
  isFirstLogin = false;

  private changePwdSub: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private router: Router,
    private snackbar: SnackbarService
  ) {}

  ngOnInit(): void {
    // Check if user is authenticated
    const user = this.tokenStorage.getUser();
    if (!user?.email) {
      this.router.navigate(['/auth/sign-in']);
      return;
    }

    this.userEmail = user.email;
    this.isFirstLogin = user.mustChangePassword === true;

    this.initForm();
  }

  ngOnDestroy(): void {
    this.changePwdSub?.unsubscribe();
  }

  private initForm(): void {
    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Custom validator for password strength
  private passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;

    if (!passwordValid) {
      return {
        passwordStrength: {
          hasUpperCase,
          hasLowerCase,
          hasNumeric,
          hasSpecialChar
        }
      };
    }
    return null;
  }

  // Custom validator to check if passwords match
  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.changePasswordForm.invalid || this.loading) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const { currentPassword, newPassword, confirmPassword } = this.changePasswordForm.value;

    this.changePwdSub = this.authService.changePassword({
      currentPassword,
      newPassword,
      confirmPassword
    }).subscribe({
      next: (response) => {
        this.loading = false;
        this.snackbar.alertSuccess(response.message || 'Password changed successfully');

        // Update user object to clear mustChangePassword flag
        const user = this.tokenStorage.getUser();
        if (user) {
          user.mustChangePassword = false;
          this.tokenStorage.saveUser(user);
        }

        // Navigate based on whether this was a first login or voluntary change
        if (this.isFirstLogin) {
          // First login - go to dashboard
          this.router.navigate(['/dashboard/home']);
        } else {
          // Voluntary change - go back to login
          this.authService.logout();
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || err?.message || 'Failed to change password. Please try again.';
        this.snackbar.alertError(this.error);
      }
    });
  }

  // Form control getters
  get currentPasswordControl() { return this.changePasswordForm.get('currentPassword'); }
  get newPasswordControl() { return this.changePasswordForm.get('newPassword'); }
  get confirmPasswordControl() { return this.changePasswordForm.get('confirmPassword'); }

  // Password strength indicators
  get passwordStrengthErrors() {
    return this.newPasswordControl?.errors?.['passwordStrength'];
  }

  backToLogin(): void {
    this.authService.logout();
  }
}
