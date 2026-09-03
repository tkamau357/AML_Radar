import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from "../models/user";

const TOKEN_KEY = 'auth-token';
const REFRESH_TOKEN_KEY = 'refresh-token';
const USER_KEY = 'auth-user';
const USER_ACCESS_POLICIES = 'user-access-policies';
const ACTIVITY_KEY = 'user-active';
const TEMP_EMAIL_KEY = 'temp-email';
const USER_ROLES_KEY = 'user-roles';
const ACCESS_TOKEN_KEY = 'access-token';

export interface TokenDetails {
  iat: number;
  expat: number;
  clientSaveTime: number; // Make required, not optional
}

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {

  private readonly tokenDetailsSubject = new BehaviorSubject<TokenDetails | null>(
    JSON.parse(window.sessionStorage.getItem(TOKEN_KEY) || 'null')
  );
  public readonly tokenDetails$ = this.tokenDetailsSubject.asObservable();

  constructor() { }

  public savePolicies(policies: any[]): void {
    window.sessionStorage.removeItem(USER_ACCESS_POLICIES);
    window.sessionStorage.setItem(USER_ACCESS_POLICIES, JSON.stringify(policies));
  }

  public saveToken(token: string): void {
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
  }

  public getToken(): string | null {
    return window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
  }

  public getPolicies(): any[] {
    const policies = window.sessionStorage.getItem(USER_ACCESS_POLICIES);
    if (policies) {
      return JSON.parse(policies);
    }
    return [];
  }

  /** Save user roles */
  public saveUserRoles(roles: any[]): void {
    window.sessionStorage.removeItem(USER_ROLES_KEY);
    window.sessionStorage.setItem(USER_ROLES_KEY, JSON.stringify(roles));
  }

  /** Get user roles */
  public getUserRoles(): any[] {
    const roles = window.sessionStorage.getItem(USER_ROLES_KEY);
    return roles ? JSON.parse(roles) : [];
  }

  /** Clear user roles */
  public clearUserRoles(): void {
    window.sessionStorage.removeItem(USER_ROLES_KEY);
  }

  public saveTokenDetails(tokenDetails: { iat: string | number; expat: string | number }): void {
    const normalizeDate = (dateString: string | number): number => {
      if (typeof dateString === 'number') {
        return dateString;
      }
      // Replace EAT with UTC+3 offset
      const fixed = dateString.replace('EAT', '+0300');
      return Math.floor(new Date(fixed).getTime() / 1000);
    };

    const normalizedToken: TokenDetails = {
      iat: normalizeDate(tokenDetails.iat),
      expat: normalizeDate(tokenDetails.expat),
      // Recorded on the client clock so elapsed time can be computed without
      // relying on the client clock being in sync with the server's absolute epoch.
      clientSaveTime: Math.floor(Date.now() / 1000),
    };

    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, JSON.stringify(normalizedToken));
    this.tokenDetailsSubject.next(normalizedToken);
    // New token = new activity tracking period; any pre-refresh activity is irrelevant.
    window.sessionStorage.removeItem(ACTIVITY_KEY);
  }

  public saveUserActivity(isActive: boolean): void {
    if (isActive) {
      window.sessionStorage.setItem(ACTIVITY_KEY, 'true');
    } else {
      window.sessionStorage.removeItem(ACTIVITY_KEY);
    }
  }

  public getUserActivity(): boolean {
    return window.sessionStorage.getItem(ACTIVITY_KEY) === 'true';
  }

  public clearSession(): void {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.removeItem(USER_ACCESS_POLICIES);
    window.sessionStorage.removeItem(ACTIVITY_KEY);
    window.sessionStorage.removeItem(TEMP_EMAIL_KEY);
    window.sessionStorage.removeItem(USER_ROLES_KEY);

    this.tokenDetailsSubject.next(null);
  }

  public getTokenDetails(): TokenDetails | null {
    const token = window.sessionStorage.getItem(TOKEN_KEY);
    if (!token) {
      return null;
    }
    try {
      return JSON.parse(token);
    } catch {
      return null;
    }
  }

  public decodeJWT(): any {
    const token = this.getTokenDetails();
    if (!token) {
      return null;
    }
    try {
      // Note: This assumes token is stored as a JWT string
      // You may need to adjust this based on your actual token storage
      return null;
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  public saveRefreshToken(token: string): void {
    window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    window.sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  public getRefreshToken(): string | null {
    return window.sessionStorage.getItem(REFRESH_TOKEN_KEY);
  }

  public isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Check if token is expired
   */
  public isTokenExpired(): boolean {
    const details = this.getTokenDetails();
    if (!details) return true;
    
    const now = Math.floor(Date.now() / 1000);
    // Add 60 second buffer for clock skew
    return details.expat - 60 <= now;
  }

  /**
   * Get time remaining until token expires (in seconds)
   */
  public getTokenRemainingTime(): number {
    const details = this.getTokenDetails();
    if (!details) return 0;
    
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, details.expat - now);
  }

  public saveUser(user: User): void {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getUser(): User {
    const user = window.sessionStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user);
    }
    return {} as User;
  }

  private readonly OTP_EXPIRY_KEY = 'otp_expiry_seconds';

  setOtpExpirySeconds(seconds: number): void {
    localStorage.setItem(this.OTP_EXPIRY_KEY, seconds.toString());
  }

  getOtpExpirySeconds(): number {
    return parseInt(localStorage.getItem(this.OTP_EXPIRY_KEY) || '180', 10);
  }

  clearOtpExpirySeconds(): void {
    localStorage.removeItem(this.OTP_EXPIRY_KEY);
  }

  // ==================== Temp Email for OTP Flow ====================
  public setTempEmail(email: string): void {
    window.sessionStorage.setItem(TEMP_EMAIL_KEY, email);
  }

  public getTempEmail(): string | null {
    return window.sessionStorage.getItem(TEMP_EMAIL_KEY);
  }

  public clearTempEmail(): void {
    window.sessionStorage.removeItem(TEMP_EMAIL_KEY);
  }
}