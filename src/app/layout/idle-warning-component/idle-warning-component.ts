import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SessionService } from '../../core/service/session.service';


@Component({
  selector: 'app-idle-warning-component',
  standalone: false,
  templateUrl: './idle-warning-component.html',
  styleUrl: './idle-warning-component.scss',
})
export class IdleWarningComponent implements OnInit, OnDestroy {
    showWarning = false;
    timeLeft = 60;
    private warningSubscription: Subscription | null = null;
    private timerInterval: any;

    constructor(private sessionService: SessionService) {}

    ngOnInit(): void {
        this.warningSubscription = this.sessionService.warning$.subscribe(
            (show: any) => {
                this.showWarning = show;
                if (show) {
                    this.startCountdown();
                } else {
                    this.clearCountdown();
                }
            }
        );
    }

    ngOnDestroy(): void {
        this.warningSubscription?.unsubscribe();
        this.clearCountdown();
    }

    private startCountdown(): void {
        this.timeLeft = 60;
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            if (this.timeLeft <= 0) {
                this.clearCountdown();
            }
        }, 1000);
    }

    private clearCountdown(): void {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    stayLoggedIn(): void {
        this.sessionService.resetTimer();
        this.showWarning = false;
        this.clearCountdown();
    }
}
