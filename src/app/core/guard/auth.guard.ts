// src/app/core/guard/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { TokenStorageService } from '../service/token-storage.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(
        private tokenStorage: TokenStorageService,
        private router: Router
    ) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean {
        // ✅ 1. Check if user is logged in (Token exists in SessionStorage)
        if (!this.tokenStorage.isLoggedIn()) {
            this.router.navigate(['/auth/sign-in'], {
                queryParams: { returnUrl: state.url }
            });
            return false;
        }

        // ✅ 2. Check if token is expired
        if (this.tokenStorage.isTokenExpired()) {
            this.tokenStorage.clearSession();
            this.router.navigate(['/auth/sign-in']);
            return false;
        }

        // ✅ 3. Allow access if no permissions are specified (Top-level pages like Dashboard)
        const requiredPermissions = route.data?.['permissions'];
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        // ✅ 4. Optionally check specific permissions if needed
        // (Use your AccessControlService here if you have one)
        return true;
    }
}