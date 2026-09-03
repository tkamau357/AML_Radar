import { Component, OnInit, OnDestroy, ChangeDetectorRef } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { finalize } from "rxjs/operators";
import { NotificationToastService } from "../../data/services/notification-toast.service";
import { AuthService } from "../../core/service/auth.service";
import { TokenStorageService } from "../../core/service/token-storage.service";

@Component({
  selector: "app-signin",
  templateUrl: "./signin.component.html",
  styleUrls: ["./signin.component.css"],
  standalone: false
})
export class SigninComponent implements OnInit, OnDestroy {
  authForm!: FormGroup;
  loading = false;
  error = "";
  hide = true;
  returnUrl: string = '/dashboard';
  private loginSubscription: Subscription | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.authForm = this.formBuilder.group({
      username: ['', [Validators.required]], 
      pHolder: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit() {
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
      this.authForm.patchValue({ username: savedEmail, rememberMe: true });
    }

    history.pushState(null, '', window.location.href);
    window.onpopstate = () => {
      history.pushState(null, '', window.location.href);
    };
  }

  ngOnDestroy(): void {
    this.loginSubscription?.unsubscribe();
    window.onpopstate = null;
  }

  get f() {
    return this.authForm.controls;
  }

  onSubmit() {
    if (this.loading) return;

    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      if (this.authForm.get('pHolder')?.errors?.['minlength']) {
        this.error = 'Password must be at least 6 characters long.';
      } else if (this.authForm.get('username')?.errors?.['required']) {
        this.error = 'Username is required.';
      }
      return;
    }

    this.loading = true;
    this.error = '';

    const credentials = {
      email: this.authForm.value.username,
      password: this.authForm.value.pHolder,
    };

    this.loginSubscription = this.authService.login(credentials).pipe(
      // GUARANTEED to run on success, error, OR unsubscribe
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges(); // Force Angular to update the view
      })
    ).subscribe({
      next: (response) => {
        if (this.authForm.value.rememberMe) {
          localStorage.setItem('savedEmail', this.authForm.value.username);
        } else {
          localStorage.removeItem('savedEmail');
        }

        // Check if user must change password (skip OTP)
        if (response.skipOtp) {
          // Keep loading true for the second request
          this.loading = true;
          this.cdr.detectChanges();
          
          // User needs to change password - call loginPasswordReset to get tokens
          this.authService.loginPasswordReset(credentials).pipe(
            finalize(() => {
              this.loading = false;
              this.cdr.detectChanges();
            })
          ).subscribe({
            next: () => {
              this.router.navigate(['/auth/change-password']);
            },
            error: (error) => {
              this.error = error.message || 'Authentication failed. Please try again.';
              this.notificationService.alertError(this.error);
            }
          });
          return;
        }

        // Normal flow: Navigate to OTP verification
        this.router.navigate(['/auth/verify-otp'], {
          state: { 
            email: this.authForm.value.username,
            otpExpirySeconds: response.otpExpirySeconds
          }
        });
      },
      error: (error) => {
        this.error = error.message || 'Invalid credentials. Please try again.';
        this.notificationService.alertError(this.error);
        
        if (error.status === 423 || error.message?.includes('locked')) {
          this.notificationService.alertWarning(
            'Your account has been locked due to multiple failed attempts. Please contact support.',
            'OK',
            0
          );
        }
      }
    });
  }
}