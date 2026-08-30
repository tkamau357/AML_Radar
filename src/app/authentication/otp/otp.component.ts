import { Component, OnDestroy, OnInit, ViewChildren, ElementRef, AfterViewInit } from "@angular/core";
import { UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { AuthService } from "../../core/service/auth.service";
import { Router } from "@angular/router";
import { TokenStorageService } from "../../core/service/token-storage.service";
import { firstValueFrom, Subscription } from "rxjs";
import { SnackbarService } from "../../shared/services/snackbar.service";
import { RolesService } from "../../admin/role/roles.service";
import { UsersService } from "../../admin/user/users.service";

@Component({
  selector: "app-otp",
  templateUrl: "./otp.component.html",
  styleUrls: ["./otp.component.css"],
  standalone: false
})
export class OtpComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('otpInput') otpInputs!: ElementRef<HTMLInputElement>[];

  otpForm: UntypedFormGroup = new UntypedFormGroup({
    otp: new UntypedFormControl("", [Validators.required, Validators.minLength(6)]),
  });
  
  error: string = "";
  loading: boolean = false;
  resendingOtp: boolean = false;
  email: string = "";
  
  // OTP Digits
  otpDigits: string[] = ['', '', '', '', '', ''];
  currentIndex = 0;

  // ==========================
  // Countdown Timer Variables
  // ==========================
  resendTimer: number = 180; // Default fallback
  canResend: boolean = false;
  resendInterval: any = null;

  private validateSub: Subscription | null = null;
  private resendSub: Subscription | null = null;

  constructor(
    private _auth: AuthService,
    private _router: Router,
    private _tokenStorage: TokenStorageService,
    private _rolesService: RolesService, // ✅ Inject RolesService
    private _usersService: UsersService,
    private snackbar: SnackbarService,
  ) { }

  ngOnInit(): void {
    // Get email from storage
    this.email = this._tokenStorage.getTempEmail() || this._tokenStorage.getUser()?.email || '';
    
    if (!this.email) {
      this._router.navigate(['/auth/sign-in']);
      return;
    }
    
    // ✅ Start timer with dynamic OTP expiry seconds
    this.startResendTimer();
  }

  ngAfterViewInit() {
    this.focusInput(0);
  }

  ngOnDestroy(): void {
    clearInterval(this.resendInterval);
    this.validateSub?.unsubscribe();
    this.resendSub?.unsubscribe();
  }

  // ==================== OTP Input Handling ====================

  onInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value.length === 6) {
      const digits = value.split('');
      digits.forEach((digit, i) => {
        if (i < 6) {
          this.otpDigits[i] = digit;
          this.updateInputValue(i, digit);
        }
      });
      this.focusInput(5);
      this.updateOtpValue();
      return;
    }

    if (value.length > 0) {
      this.otpDigits[index] = value.slice(-1);
      this.updateInputValue(index, this.otpDigits[index]);
      if (index < 5) {
        this.focusInput(index + 1);
      } else {
        this.updateOtpValue();
      }
    }
    this.updateOtpValue();
  }

  onKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace') {
      event.preventDefault();
      if (this.otpDigits[index]) {
        this.otpDigits[index] = '';
        this.updateInputValue(index, '');
      } else if (index > 0) {
        this.otpDigits[index - 1] = '';
        this.updateInputValue(index - 1, '');
        this.focusInput(index - 1);
      }
      this.updateOtpValue();
      return;
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.focusInput(index - 1);
    }
    if (event.key === 'ArrowRight' && index < 5) {
      event.preventDefault();
      this.focusInput(index + 1);
    }
  }

  onPaste(index: number, event: ClipboardEvent): void {
    const data = event.clipboardData?.getData('text');
    if (data && data.length === 6 && /^\d{6}$/.test(data)) {
      event.preventDefault();
      const digits = data.split('');
      digits.forEach((digit, i) => {
        if (i < 6) {
          this.otpDigits[i] = digit;
          this.updateInputValue(i, digit);
        }
      });
      this.focusInput(5);
      this.updateOtpValue();
    }
  }

  private focusInput(index: number): void {
    this.currentIndex = index;
    setTimeout(() => {
      const input = this.otpInputs?.find((_, i) => i === index);
      if (input) {
        input.nativeElement.focus();
        input.nativeElement.select();
      }
    }, 50);
  }

  private updateInputValue(index: number, value: string): void {
    const input = this.otpInputs?.find((_, i) => i === index);
    if (input) {
      input.nativeElement.value = value;
    }
  }

  private updateOtpValue(): void {
    const otp = this.otpDigits.join('');
    this.otpForm.patchValue({ otp });
  }

  // ==================== OTP Validation ====================

  async validateOtp() {
  if (this.otpForm.invalid || this.loading) {
    return;
  }

  this.loading = true;
  this.error = '';

  this.validateSub = this._auth
    .verifyOtp({
      otp: this.otpForm.value.otp,
      email: this.email
    })
    .subscribe({
      next: async (res) => {
        // AuthService.verifyOtp already saves token, user, refresh token,
        // token details and policies via its tap() handler.
        // Role fetch is best-effort — a 403 must not block navigation.
        try {
          await this.fetchAndStoreUserRoles(res.user?.id);
        } catch (error) {
          // Non-fatal: user is authenticated, roles just won't be pre-fetched.
          console.warn('Role fetch failed (non-fatal):', error);
        }

        this.snackbar.alertSuccess(res.message || 'Login successful');
        this._router.navigate(['/dashboard/home']);
      },

      error: (err) => {
        console.error('OTP verification error:', err);

        this.loading = false;
        this.error =
          err?.error?.message || 'OTP verification failed.';

        this.snackbar.alertError(this.error);

        this.otpDigits = ['', '', '', '', '', ''];
        this.updateOtpValue();
        this.focusInput(0);
      }
    });
}

  async fetchAndStoreUserRoles(
    userId: string | number | undefined
  ): Promise<void> {
    if (userId === undefined || userId === null) {
      console.warn('User ID is undefined. Skipping role fetch.');
      return;
    }

    try {
      const userDetails: any = await firstValueFrom(
        this._usersService.getUserById(Number(userId))
      );

      this._tokenStorage.saveUser(userDetails);

      const roleId = userDetails?.role?.id;

      if (roleId) {
        const roleDetails: any = await firstValueFrom(
          this._rolesService.getRoleById(roleId)
        );

        this._tokenStorage.saveUserRoles([roleDetails]);

        if (roleDetails?.permissions) {
          this._tokenStorage.savePolicies(roleDetails.permissions);
        }
      }
    } catch (error) {
      // Best-effort — log and continue. Navigation will still proceed.
      console.warn('fetchAndStoreUserRoles failed (non-fatal):', error);
    }
  }

  // ==================== Resend OTP ====================
  resendOtp() {
    if (this.resendTimer > 0 || this.loading) return;
    
    this.resendingOtp = true;
    this.error = '';
    
    // ✅ FIXED: Pass email as a string directly (Service appends it as ?email=)
    this.resendSub = this._auth.resendOtp(this.email).subscribe({
      next: (res) => {
        this.resendingOtp = false;
        this.snackbar.alertSuccess('OTP resent successfully');
        this.startResendTimer(); // Restart timer on success
        this.resetOtpInputs();
      },
      error: (err) => {
        this.resendingOtp = false;
        this.error = "Could not resend OTP try again later";
        this.snackbar.alertError(this.error);
      }
    });
  }

  // ==========================
  // Start countdown timer (Replicated from sample)
  // ==========================
  startResendTimer() {
    clearInterval(this.resendInterval);
    
    // ✅ Get the dynamic OTP expiry seconds from storage
    this.resendTimer = this._tokenStorage.getOtpExpirySeconds() || 180; 
    this.canResend = false;

    this.resendInterval = setInterval(() => {
      this.resendTimer--;

      if (this.resendTimer <= 0) {
        clearInterval(this.resendInterval);
        this.canResend = true;
      }
    }, 1000);
  }

  // ==========================
  // Text to show on UI
  // ==========================
  get resendText(): string {
    if (this.resendTimer <= 0) {
      if (this.resendingOtp) {
        return 'Resending OTP...';
      }
      return 'Resend OTP';
    }

    if (this.resendTimer > 60) {
      const mins = Math.floor(this.resendTimer / 60);
      const secs = this.resendTimer % 60;
      return `Resend OTP in... ${mins} min${mins > 1 ? 's' : ''} ${secs} sec${secs > 1 ? 's' : ''}`;
    }

    return `Resend OTP in... ${this.resendTimer}s`;
  }

  backToLogin(){
    this._tokenStorage.clearTempEmail();
    window.location.href = '/auth/sign-in';
  }

  private resetOtpInputs(): void {
    this.otpDigits = ['', '', '', '', '', ''];
    this.updateOtpValue();
    this.focusInput(0);
  }
}