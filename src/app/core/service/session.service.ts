// src/app/core/service/session.service.ts
import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class SessionService implements OnDestroy {
    private readonly SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
    private inactivityTimer: any = null;
    private warningSubject = new BehaviorSubject<boolean>(false);
    public warning$ = this.warningSubject.asObservable();
    private isMonitoring = false;

    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    startMonitoring(): void {
        if (this.isMonitoring) return;
        this.isMonitoring = true;
        this.resetTimer();
        this.setupUserActivityListeners();
    }

    stopMonitoring(): void {
        this.isMonitoring = false;
        this.clearTimer();
        this.removeUserActivityListeners();
        this.warningSubject.next(false);
    }

    resetTimer(): void {
        this.clearTimer();
        this.warningSubject.next(false);

        // Show warning 1 minute before timeout
        this.inactivityTimer = setTimeout(() => {
            this.warningSubject.next(true);
        }, this.SESSION_TIMEOUT - 60000);
    }

    private clearTimer(): void {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }
    }

    private setupUserActivityListeners(): void {
        const events = ['click', 'keydown', 'scroll', 'mousemove', 'touchstart'];
        events.forEach(event => {
            document.addEventListener(event, this.onUserActivity.bind(this));
        });
    }

    private removeUserActivityListeners(): void {
        const events = ['click', 'keydown', 'scroll', 'mousemove', 'touchstart'];
        events.forEach(event => {
            document.removeEventListener(event, this.onUserActivity.bind(this));
        });
    }

    private onUserActivity(): void {
        if (this.warningSubject.value) {
            // User clicked during warning - extend session
            this.warningSubject.next(false);
            this.resetTimer();
        } else {
            this.resetTimer();
        }
    }

    ngOnDestroy(): void {
        this.stopMonitoring();
    }
}