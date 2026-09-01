import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, tap, catchError, throwError, shareReplay, finalize } from "rxjs";
import { Router } from "@angular/router";
import { environment } from "../../../environments/environment";
import { TokenStorageService } from "./token-storage.service";
import { RefreshTokenResponse, LoginRequest, LoginResponse, VerifyOtpRequest, AuthResponse } from "../models/auth.model";
import { User, Role, Permission } from "../models/user";

const AUTH_API = `${environment.apiUrl}/api/v1/auth`;

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private refreshTokenObservable: Observable<RefreshTokenResponse> | null = null;

  // src/app/core/service/auth.service.ts
  constructor(
      private http: HttpClient,
      private tokenStorage: TokenStorageService,
      private router: Router
  ) {
      // Restore auth state on hard refresh
      if (this.tokenStorage.isLoggedIn()) {
          this.isAuthenticatedSubject.next(true);
          const user = this.tokenStorage.getUser();
          if (user) {
              this.currentUserSubject.next(user);
          }
      }
  }

  /**
   * Login - Step 1: Validate credentials and request OTP
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${AUTH_API}/login`, credentials).pipe(
      tap(response => {
        // Store email for OTP verification
        this.tokenStorage.setTempEmail(credentials.email);
        
        // ✅ Store the OTP expiry seconds in TokenStorage 
        // (This fixes the error and ensures it's persisted even on refresh)
        if (response.otpExpirySeconds) {
          this.tokenStorage.setOtpExpirySeconds(response.otpExpirySeconds);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Verify OTP - Step 2: Complete authentication with OTP
   */
  verifyOtp(request: VerifyOtpRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${AUTH_API}/verify-otp`, request).pipe(
      tap(response => {
        if (response && response.user) {
          this.handleSuccessfulAuth(response);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Resend OTP
   */
  resendOtp(email: string): Observable<{ message: string }> {
    // ✅ FIXED: Use HttpParams to append ?email=... to the URL
    return this.http.post<{ message: string }>(`${AUTH_API}/resend-otp`, null, {
      params: { email: email }
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Login for Password Reset Users - Skip OTP
   * Used when user has mustChangePassword = true
   */
  loginPasswordReset(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${AUTH_API}/login-password-reset`, credentials).pipe(
      tap(response => {
        if (response && response.user) {
          this.handleSuccessfulAuth(response);
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Refresh Token - Silent background refresh
   */
  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    if (!this.refreshTokenObservable) {
      this.refreshTokenObservable = this.http
        .post<RefreshTokenResponse>(`${AUTH_API}/refresh`, { refreshToken })
        .pipe(
          tap(response => {
            if (response) {
              // Save token details without clientSaveTime (it's added in the service)
              this.tokenStorage.saveTokenDetails({
                iat: response.iat,
                expat: response.expat
              });
              this.tokenStorage.saveRefreshToken(response.refreshToken);
            }
          }),
          shareReplay(1),
          finalize(() => (this.refreshTokenObservable = null))
        );
    }
    return this.refreshTokenObservable;
  }

  /**
   * Logout
   */
  logout(): void {
    const user = this.tokenStorage.getUser();
    
    // Send logout request with sendBeacon for reliable delivery
    if (user?.email) {
      navigator.sendBeacon(
        `${AUTH_API}/logout`,
        new Blob(
          [JSON.stringify({ userEmail: user.email })],
          { type: 'application/json' }
        )
      );
    }

    this.clearAuthState();
    this.router.navigate(['/auth/sign-in']);
  }

  /**
   * Get current user profile
   */
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${AUTH_API}/me`).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        this.tokenStorage.saveUser(user);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Change password
   */
  changePassword(data: { 
    currentPassword: string; 
    newPassword: string; 
    confirmPassword?: string 
  }): Observable<{ message: string }> {
    // Backend only expects currentPassword and newPassword
    const payload = {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword
    };
    return this.http.post<{ message: string }>(`${AUTH_API}/change-password`, payload).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update profile
   */
  updateProfile(data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${AUTH_API}/profile`, data).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        this.tokenStorage.saveUser(user);
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Check if user has a specific role
   */
  hasRole(roleName: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user?.roles) return false;
    return user.roles.some(role => 
      role.name === roleName || role.name === `ROLE_${roleName}`
    );
  }

  /**
   * Check if user has a specific permission
   */
  hasPermission(permissionName: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user?.permissions) return false;
    return user.permissions.some(p => p.name === permissionName);
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  /**
   * Check if user has all of the specified roles
   */
  hasAllRoles(roles: string[]): boolean {
    return roles.every(role => this.hasRole(role));
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(perm => this.hasPermission(perm));
  }

  getTokenDetails(): { iat: number; expat: number; clientSaveTime: number } | null {
    return this.tokenStorage.getTokenDetails();
}
  /**
   * Check if user has all of the specified permissions
   */
  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(perm => this.hasPermission(perm));
  }

  // ==================== Private Methods ====================

  
  private handleSuccessfulAuth(response: AuthResponse): void {
    // Save authenticated user
    this.currentUserSubject.next(response.user);
    this.tokenStorage.saveUser(response.user);

    // Save the actual access token
    if (response.accessToken) {
      this.tokenStorage.saveToken(response.accessToken);
    }

    // Save refresh token
    if (response.refreshToken) {
      this.tokenStorage.saveRefreshToken(response.refreshToken);
    }

    // Calculate token expiry from expiresIn
    const now = Math.floor(Date.now() / 1000);

    this.tokenStorage.saveTokenDetails({
      iat: now,
      expat: now + response.expiresIn
    });

    // Save permissions returned by backend
    if (response.user?.permissions) {
      this.tokenStorage.savePolicies(response.user.permissions);
    }

    // Mark user as authenticated
    this.isAuthenticatedSubject.next(true);

    // Clear temporary OTP email
    this.tokenStorage.clearTempEmail();
  }


  private clearAuthState(): void {
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.tokenStorage.clearSession();
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred. Please try again.';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.status === 401) {
      errorMessage = 'Invalid credentials. Please try again.';
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to perform this action.';
    } else if (error.status === 404) {
      errorMessage = 'The requested resource was not found.';
    } else if (error.status === 500) {
      errorMessage = 'A server error occurred. Please try again later.';
    }

    return throwError(() => ({ ...error, message: errorMessage }));
  }

  isTokenExpired(): boolean {
    return this.tokenStorage.isTokenExpired();
  }

  // ==================== Public Getters ====================

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  get userRoles(): Role[] {
    return this.currentUser?.roles || [];
  }

  get userPermissions(): Permission[] {
    return this.currentUser?.permissions || [];
  }
}