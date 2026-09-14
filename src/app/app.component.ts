import { Component, OnDestroy, OnInit } from "@angular/core";
import { Event, Router, NavigationStart, NavigationEnd } from "@angular/router";
import { distinctUntilChanged, filter, Subject, takeUntil } from "rxjs";
import { AuthService } from "./core/service/auth.service";
import { SessionService } from "./core/service/session.service";

@Component({
    selector: "app-root",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"],
    standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
    currentUrl = '';
    private destroy$ = new Subject<void>();
    private isAuthenticated = false;

    constructor(
        public _router: Router,
        private authService: AuthService,
        private sessionService: SessionService
    ) {
        // Prevent multiple tabs - existing functionality
        const isOldTab = localStorage.getItem("id");
        if (performance.navigation.type == performance.navigation.TYPE_RELOAD) {
            console.info("This page is reloaded");
        } else if (isOldTab) {
            console.info("Multiple sessions of this site are not allowed");
        } 

        // Track navigation events
        this._router.events.subscribe((routerEvent: Event) => {
            if (routerEvent instanceof NavigationStart) {
                this.currentUrl = routerEvent.url.substring(
                    routerEvent.url.lastIndexOf("/") + 1
                );
            }
            if (routerEvent instanceof NavigationEnd) {
                // Handle navigation end if needed
            }
            window.scrollTo(0, 0);
        });
    }

    ngOnInit(): void {
        // Subscribe to authentication state
        this.authService.isAuthenticated$
            .pipe(
                filter((isAuthenticated): isAuthenticated is boolean => isAuthenticated !== null),
                distinctUntilChanged(),
                takeUntil(this.destroy$)
            )
            .subscribe((isAuthenticated: boolean) => {
                console.log(`[AppComponent] isAuthenticated$ emitted: ${isAuthenticated}`);
                this.isAuthenticated = isAuthenticated;
                
                if (isAuthenticated) {
                    console.log(`[AppComponent] → calling sessionService.startMonitoring()`);
                    this.sessionService.startMonitoring();
                } else {
                    console.log(`[AppComponent] → calling sessionService.stopMonitoring()`);
                    this.sessionService.stopMonitoring();
                }
            });

        // Handle token validation on init
        this.validateTokenOnInit();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Validate token on app initialization
     * Redirect to sign-in if token is invalid or expired
     */
    private validateTokenOnInit(): void {
        // Check if user is authenticated but token might be expired
        if (this.authService.isAuthenticated && this.authService.isTokenExpired()) {
            console.log('[AppComponent] Token expired on init, logging out');
            this.authService.logout();
        }
    }
}