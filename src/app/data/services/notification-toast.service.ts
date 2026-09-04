import { Injectable } from "@angular/core";
import { MatSnackBar, MatSnackBarHorizontalPosition,
 MatSnackBarVerticalPosition,
} from "@angular/material/snack-bar";
import { RealtimeNotificationToastData, RealtimeNotificationToastComponent } from "../../shared/components/realtime-notification-toast/realtime-notification-toast.component";

@Injectable({
  providedIn: "root",
})
export class NotificationToastService {
  horizontalPosition: MatSnackBarHorizontalPosition = "end";
  verticalPosition: MatSnackBarVerticalPosition = "top";

  constructor(private _snackBar: MatSnackBar) { }

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