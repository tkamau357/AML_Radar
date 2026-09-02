/**
 * Unified HTTP Interceptor
 * 
 * This interceptor combines auth token handling, error handling, and loading state management
 * into a single unified interceptor to avoid race conditions and ensure consistent behavior.
 * 
 * Features:
 * - Adds JWT Bearer token to all non-auth requests
 * - Handles 401 errors with token refresh (single refresh in progress at a time)
 * - Automatically manages global loading state for all HTTP requests
 * - Guarantees loading state cleanup via finalize() operator
 */
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, take, switchMap, finalize } from 'rxjs/operators';
import { TokenStorageService } from '../service/token-storage.service';
import { AuthService } from '../service/auth.service';
import { LoadingService } from '../service/loading.service';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {
  
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private tokenStorage: TokenStorageService,
    private authService: AuthService,
    private loadingService: LoadingService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Determine if this request should show loading indicator
    const shouldShowLoading = this.shouldShowLoading(request);
    
    // Show loading for this request
    if (shouldShowLoading) {
      this.loadingService.show();
    }

    // Skip token handling for auth endpoints
    if (this.isAuthEndpoint(request.url)) {
      return next.handle(request.clone({ withCredentials: true })).pipe(
        finalize(() => {
          if (shouldShowLoading) {
            this.loadingService.hide();
          }
        }),
        catchError(error => this.handleError(error))
      );
    }

    // Add authorization header if token exists
    const token = this.tokenStorage.getToken();
    let authRequest = request.clone({ withCredentials: true });
    
    if (token) {
      authRequest = request.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
    }

    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          return this.handle401Error(authRequest, next, shouldShowLoading);
        }
        return throwError(() => error);
      }),
      finalize(() => {
        // GUARANTEED to run on success, error, or unsubscribe
        if (shouldShowLoading) {
          this.loadingService.hide();
        }
      })
    );
  }

  /**
   * Determine if this request should show the loading indicator.
   * Skip loading for background requests, polling, etc.
   */
  private shouldShowLoading(request: HttpRequest<any>): boolean {
    // Skip loading for requests with custom header
    if (request.headers.has('X-Skip-Loading')) {
      return false;
    }
    
    // Skip loading for certain endpoints (polling, background sync, etc.)
    const silentEndpoints = [
      '/auth/refresh',
      '/notifications/poll',
      '/health'
    ];
    
    return !silentEndpoints.some(endpoint => request.url.includes(endpoint));
  }

  /**
   * Check if this is an authentication endpoint (skip token handling)
   */
  private isAuthEndpoint(url: string): boolean {
    const authEndpoints = [
      '/auth/login',
      '/auth/verify-otp',
      '/auth/resend-otp',
      '/auth/refresh',
      '/auth/login-password-reset',
      '/auth/change-password'
    ];
    return authEndpoints.some(endpoint => url.includes(endpoint));
  }

  /**
   * Handle 401 Unauthorized errors with token refresh
   */
  private handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler,
    isShowingLoading: boolean
  ): Observable<HttpEvent<any>> {
    
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((response) => {
          this.isRefreshing = false;
          const newToken = response.accessToken || '';
          this.refreshTokenSubject.next(newToken);
          
          // Retry the original request with new token
          return next.handle(request.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` },
            withCredentials: true
          }));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(null);
          
          // Token refresh failed - logout user
          this.authService.logout();
          return throwError(() => err);
        }),
        finalize(() => {
          // Ensure loading is hidden after refresh attempt
          if (isShowingLoading) {
            this.loadingService.hide();
          }
        })
      );
    } else {
      // Another refresh is in progress - wait for it
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap((token) => {
          return next.handle(request.clone({
            setHeaders: { Authorization: `Bearer ${token || ''}` },
            withCredentials: true
          }));
        })
      );
    }
  }

  /**
   * Handle errors uniformly
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    // Let the error propagate - GlobalErrorHandler will catch uncaught ones
    return throwError(() => error);
  }
}
