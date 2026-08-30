import { Injectable } from "@angular/core";
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from "@angular/material/snack-bar";
import { RealtimeNotificationToastData, RealtimeNotificationToastComponent } from "../../shared/components/realtime-notification-toast/realtime-notification-toast.component";

@Injectable({
  providedIn: "root",
})
export class NotificationToastService {
  private readonly soundPreferenceKey = 'notification_sound_enabled';
  private readonly audio = new Audio('/assets/sounds/notification.mp3');
  private audioUnlocked = false;

  horizontalPosition: MatSnackBarHorizontalPosition = "end";
  verticalPosition: MatSnackBarVerticalPosition = "top";

  constructor(private _snackBar: MatSnackBar) {
    // Check initial sound preference and try to unlock audio if enabled
    if (this.isSoundEnabled) {
      this.unlockAudio();
    }
  }

  unlockAudio(): void {
    if (this.audioUnlocked) return;

    this.audio.muted = true;
    void this.audio.play()
      .then(() => {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.muted = false;
        this.audioUnlocked = true;
      })
      .catch(() => {
        // Keep the sound locked and retry on the next genuine user interaction.
      });
  }

  get isAudioUnlocked(): boolean {
    return this.audioUnlocked;
  }

  get isSoundEnabled(): boolean {
    return localStorage.getItem(this.soundPreferenceKey) === 'true';
  }

  enableSound(): void {
    localStorage.setItem(this.soundPreferenceKey, 'true');
    this.unlockAudio();
  }

  disableSound(): void {
    localStorage.setItem(this.soundPreferenceKey, 'false');
    // Optionally stop any currently playing sound
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  toggleSound(): boolean {
    if (this.isSoundEnabled) {
      this.disableSound();
      return false;
    } else {
      this.enableSound();
      this.playSound(); // Test the sound
      return true;
    }
  }

  playSound(): void {
    if (!this.audioUnlocked || !this.isSoundEnabled) {
      return;
    }

    this.audio.currentTime = 0;
    void this.audio.play().catch(() => {
      // Browsers require a user interaction before allowing audio playback.
    });
  }

  alertSuccess(
    message: string,
    action: string = "OK",
    duration: number = 2000,
  ): void {
    this._snackBar.open(message, action, {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration,
      panelClass: ["snackbar-success"],
    });
  }

  alertError(
    message: string,
    action: string = "X",
    duration: number = 3000,
  ): void {
    this._snackBar.open(message, action, {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration,
      panelClass: ["snackbar-danger"],
    });
  }

  alertWarning(
    message: string,
    action: string = "X",
    duration: number = 5000,
  ): void {
    this._snackBar.open(message, action, {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration,
      panelClass: ["snackbar-warning"],
    });
  }

  alertInfo(
    message: string,
    action: string = "OK",
    duration: number = 4000,
  ): void {
    this._snackBar.open(message, action, {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration,
      panelClass: ["snackbar-info"],
    });
  }

  showNotification(title: string, message: string, duration: number = 3000): void {
    const data: RealtimeNotificationToastData = { title, message, duration };

    this._snackBar.openFromComponent(RealtimeNotificationToastComponent, {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      data,
      panelClass: ['realtime-notification-alert'],
    });
  }

  dismissAll(): void {
    this._snackBar.dismiss();
  }

  showCustom(
    message: string,
    action: string = "OK",
    duration: number = 5000,
    panelClass: string[] = [],
  ): void {
    this._snackBar.open(message, action, {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: duration,
      panelClass: panelClass,
    });
  }
}