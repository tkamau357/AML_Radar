import { Injectable } from "@angular/core";
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from "@angular/common/http";
import { BehaviorSubject, catchError, filter, finalize, Observable, switchMap, take, throwError } from "rxjs";
import { AuthService } from "../service/auth.service";
import { TokenStorageService } from "../service/token-storage.service";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(
    private tokenStorage: TokenStorageService, 
    private authService: AuthService
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip adding token for auth endpoints
    if (this.isAuthEndpoint(request.url)) {
      return next.handle(request);
    }

    // Get the JWT token
    const token = this.tokenStorage.getToken();

    // Clone request and add Authorization header if token exists
    let authRequest = request;
    if (token) {
      authRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      });
    }

    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !this.isAuthEndpoint(request.url)) {
          return this.handle401Error(authRequest, next);
        }
        return throwError(() => error);
      })
    );
  }

  private isAuthEndpoint(url: string): boolean {
    return url.includes('/auth/login') ||
      url.includes('/auth/verify-otp') ||
      url.includes('/auth/resend-otp') ||
      url.includes('/auth/refresh');
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((response) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(response.accessToken || '');
          
          // Retry the request with new token
          return next.handle(request.clone({
            setHeaders: {
              Authorization: `Bearer ${response.accessToken}`
            }
          }));
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => err);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap((token) => {
          return next.handle(request.clone({
            setHeaders: {
              Authorization: `Bearer ${token || ''}`
            }
          }));
        })
      );
    }
  }
}