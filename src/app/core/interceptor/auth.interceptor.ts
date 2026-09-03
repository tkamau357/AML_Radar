import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from '../service/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private authService: AuthService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Always allow authentication cookies
    const authReq = req.clone({
      withCredentials: true
    });

    // Don't refresh on authentication endpoints
    if (this.isAuthEndpoint(req.url)) {
      return next.handle(authReq);
    }

    return next.handle(authReq).pipe(
      catchError(error => {
        if (
          error instanceof HttpErrorResponse &&
          error.status === 401
        ) {
          return this.handle401Error(authReq, next);
        }

        return throwError(() => error);
      })
    );
  }

  private isAuthEndpoint(url: string): boolean {
    return (
      url.includes('/auth/login') ||
      url.includes('/auth/verify-otp') ||
      url.includes('/auth/resend-otp') ||
      url.includes('/auth/refresh')
    );
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(false);

      return this.authService.refreshToken().pipe(
        switchMap(() => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(true);

          return next.handle(
            req.clone({
              withCredentials: true
            })
          );
        }),
        catchError(err => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(false);
          this.authService.logout();

          return throwError(() => err);
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter(refreshed => refreshed),
      take(1),
      switchMap(() =>
        next.handle(
          req.clone({
            withCredentials: true
          })
        )
      )
    );
  }
}