import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationToastService } from '../../data/services/notification-toast.service';
import { Router } from '@angular/router';
import { User } from '../../core/models/user';
import { AuthService } from '../../core/service/auth.service';
import { SessionService } from '../../core/service/session.service';

@Component({
    selector: 'app-dashboard',
    standalone: false,
    templateUrl: './dashboard.html',
    styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit, OnDestroy {
    currentUser: User | null = null;
    currentTime: Date = new Date();
    private timerInterval: any;

    // KPI Data (will come from API)
    kpiData = {
        totalTransactions: 0,
        screenedTransactions: 0,
        suspiciousTransactions: 0,
        activeAlerts: 0,
        highRiskAlerts: 0,
        casesUnderInvestigation: 0,
        escalatedCases: 0,
        sarCases: 0,
        pendingReviews: 0,
        closedCases: 0,
        falsePositives: 0,
        sanctionsHits: 0,
        pepMatches: 0,
        watchlistMatches: 0
    };

    // Recent Activity
    recentAlerts: any[] = [];
    recentCases: any[] = [];

    // Loading states
    loading = true;
    error: string | null = null;

    constructor(
        private authService: AuthService,
        private sessionService: SessionService,
        private notificationService: NotificationToastService,
        private router: Router
    ) {}

    ngOnInit(): void {
        // Get current user
        this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
        });

        // Start session monitoring if authenticated
        if (this.authService.isAuthenticated) {
            this.sessionService.startMonitoring();
        }

        // Load dashboard data
        this.loadDashboardData();

        // Update clock
        this.timerInterval = setInterval(() => {
            this.currentTime = new Date();
        }, 1000);
    }

    ngOnDestroy(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    /**
     * Load dashboard data from API
     */
    loadDashboardData(): void {
        this.loading = true;
        this.error = null;

        // TODO: Replace with actual API calls
        // this.dashboardService.getKpiData().subscribe(...)
        // this.dashboardService.getRecentAlerts().subscribe(...)
        // this.dashboardService.getRecentCases().subscribe(...)

        // Simulate API call
        setTimeout(() => {
            this.kpiData = {
                totalTransactions: 15420,
                screenedTransactions: 14200,
                suspiciousTransactions: 342,
                activeAlerts: 56,
                highRiskAlerts: 23,
                casesUnderInvestigation: 18,
                escalatedCases: 7,
                sarCases: 4,
                pendingReviews: 12,
                closedCases: 89,
                falsePositives: 234,
                sanctionsHits: 3,
                pepMatches: 8,
                watchlistMatches: 12
            };

            this.recentAlerts = [
                { id: 1, reference: 'ALT-2026-0001', type: 'PROFILE_BREACH', severity: 'HIGH', status: 'OPEN', createdAt: new Date() },
                { id: 2, reference: 'ALT-2026-0002', type: 'SANCTIONS_MATCH', severity: 'CRITICAL', status: 'ASSIGNED', createdAt: new Date() },
                { id: 3, reference: 'ALT-2026-0003', type: 'ML_HIGH_RISK', severity: 'MEDIUM', status: 'NEW', createdAt: new Date() }
            ];

            this.recentCases = [
                { id: 1, reference: 'CAS-2026-0001', title: 'Suspicious Transfer Review', status: 'IN_PROGRESS', priority: 'HIGH', createdAt: new Date() },
                { id: 2, reference: 'CAS-2026-0002', title: 'Sanctions Match Investigation', status: 'PENDING_REVIEW', priority: 'CRITICAL', createdAt: new Date() }
            ];

            this.loading = false;
        }, 1000);
    }

    /**
     * Get user initials for avatar
     */
    getUserInitials(): string {
        if (!this.currentUser) return '?';
        const first = this.currentUser.firstName?.[0] || '';
        const last = this.currentUser.lastName?.[0] || '';
        return (first + last).toUpperCase() || this.currentUser.email?.[0]?.toUpperCase() || '?';
    }

    /**
     * Get full name
     */
    getFullName(): string {
        if (!this.currentUser) return 'User';
        return `${this.currentUser.firstName || ''} ${this.currentUser.lastName || ''}`.trim() || this.currentUser.email || 'User';
    }

    /**
     * Get user role display
     */
    getUserRole(): string {
        if (!this.currentUser?.roles?.length) return 'No Role';
        return this.currentUser.roles[0].name?.replace('ROLE_', '') || 'User';
    }

    /**
     * Logout
     */
    logout(): void {
        this.authService.logout();
    }

    /**
     * Navigate to alert details
     */
    viewAlert(alertId: number): void {
        this.router.navigate(['/admin/assessments/alerts', alertId]);
    }

    /**
     * Navigate to case details
     */
    viewCase(caseId: number): void {
        this.router.navigate(['/admin/assessments/case', caseId]);
    }

    /**
     * Get severity badge class
     */
    getSeverityClass(severity: string): string {
        const classes: { [key: string]: string } = {
            'CRITICAL': 'badge-danger',
            'HIGH': 'badge-warning',
            'MEDIUM': 'badge-info',
            'LOW': 'badge-success'
        };
        return classes[severity] || 'badge-secondary';
    }

    /**
     * Get status badge class
     */
    getStatusClass(status: string): string {
        const classes: { [key: string]: string } = {
            'NEW': 'badge-primary',
            'OPEN': 'badge-info',
            'ASSIGNED': 'badge-warning',
            'IN_PROGRESS': 'badge-warning',
            'PENDING_REVIEW': 'badge-info',
            'ESCALATED': 'badge-danger',
            'RESOLVED': 'badge-success',
            'CLOSED': 'badge-secondary',
            'FALSE_POSITIVE': 'badge-light'
        };
        return classes[status] || 'badge-secondary';
    }
}