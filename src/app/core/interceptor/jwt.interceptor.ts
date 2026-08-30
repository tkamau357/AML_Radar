// import { Injectable } from "@angular/core";
// import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from "@angular/common/http";
// import { BehaviorSubject, catchError, filter, finalize, Observable, switchMap, take, throwError } from "rxjs";
// import { AuthService } from "../service/auth.service";
// import { TokenStorageService } from "../service/token-storage.service";

// @Injectable()
// export class JwtInterceptor implements HttpInterceptor {
//   private isRefreshing = false;
//   private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

//   constructor(private tokenStorage: TokenStorageService, private authService: AuthService, private inactivityService: Inactivity) { }

//   intercept(
//     request: HttpRequest<any>,
//     next: HttpHandler
//   ): Observable<HttpEvent<any>> {

//     const token = this.tokenStorage.getTokenDetails();

//     //Cookies
//     const userId = this.tokenStorage.getUser()?.id;
//     let cloneReq = request.clone({
//       withCredentials: true,
//       setHeaders: userId ? { 'X-User-Id': String(userId) } : {}
//     });
   
//     return next.handle(cloneReq).pipe(
//       catchError((error: HttpErrorResponse) => {
//         // Handle 401 → logout, but never intercept the refresh endpoint itself:
//         // if the refresh call returns 401, refreshTokenSilently()'s own error handler
//         // owns the logout — intercepting it here would cause a double-logout race.
//         const isRefreshCall = request.url.includes('/authentication/refresh');
//         if (!isRefreshCall && (error.status === 401 || (error.error && (error.error as any).statusCode === 401))) {
//           console.warn('[JwtInterceptor] 401 on non-refresh request — triggering logout', { url: request.url });
//           return this.handle401Error(cloneReq, next);
//         }
//         return throwError(() => error);
//       })
//     );
//   }

//   private handle401Error(
//     request: HttpRequest<any>,
//     next: HttpHandler
//   ): Observable<HttpEvent<any>> {
//     this.inactivityService.performLogout('401 Unauthorized');
//     return throwError(() => new Error("Logged out due to Inactivity"));
//   }
// }
