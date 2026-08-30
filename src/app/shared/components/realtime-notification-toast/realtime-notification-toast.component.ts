import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

export interface RealtimeNotificationToastData {
  title: string;
  message: string;
  duration: number;
}

@Component({
  selector: 'app-realtime-notification-toast',
  templateUrl: './realtime-notification-toast.component.html',
  styleUrls: ['./realtime-notification-toast.component.scss'],
  standalone: false,
})
export class RealtimeNotificationToastComponent implements OnInit, OnDestroy {
  leaving = false;
  private closeTimer?: ReturnType<typeof setTimeout>;
  private dismissTimer?: ReturnType<typeof setTimeout>;

  constructor(
    @Inject(MAT_SNACK_BAR_DATA) public data: RealtimeNotificationToastData,
    private snackBarRef: MatSnackBarRef<RealtimeNotificationToastComponent>,
  ) {}

  ngOnInit(): void {
    const exitDuration = 280;
    this.closeTimer = setTimeout(() => {
      this.leaving = true;
      this.dismissTimer = setTimeout(() => this.snackBarRef.dismiss(), exitDuration);
    }, Math.max(0, this.data.duration - exitDuration));
  }

  dismiss(): void {
    this.leaving = true;
    clearTimeout(this.closeTimer);
    this.dismissTimer = setTimeout(() => this.snackBarRef.dismiss(), 280);
  }

  ngOnDestroy(): void {
    clearTimeout(this.closeTimer);
    clearTimeout(this.dismissTimer);
  }
}
