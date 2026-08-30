import { Injectable } from "@angular/core";
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from "@angular/material/snack-bar";

@Injectable({
  providedIn: "root",
})
export class SnackbarService {
  horizontalPosition: MatSnackBarHorizontalPosition = "end";
  verticalPosition: MatSnackBarVerticalPosition = "top";

  constructor(private _snackBar: MatSnackBar) { }

  showNotification(text: any, colorName: any) {
    this._snackBar.open(text, "X", {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 2000,
      panelClass: [colorName, "login-snackbar"],
    });
  }

  showErrorNotification(text: any): void {
    this._snackBar.open(text, "X", {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 3000,
      panelClass: ["snackbar-danger", "login-snackbar"],
    });
  }

  showLongErrorNotification(text: any): void {
    this._snackBar.open(text, "X", {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 10000,
      panelClass: ["snackbar-danger", "login-snackbar"],
    });
  }

  alertSuccess(text: string, horizontalPosition?: MatSnackBarHorizontalPosition): void {
    this._snackBar.open(text, "X", {
      horizontalPosition: horizontalPosition || this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 2000,
      panelClass: ["snackbar-success", "login-snackbar"],
    });
  }

  // Implemented alertError: Persistent until "OK" is clicked, acting like a simple dialog
  alertError(text: string): void {
    this._snackBar.open(text, "OK", {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 3000, // Persists until dismissed (robust for user acknowledgment)
      panelClass: ["snackbar-danger", "login-snackbar"], // Use Tailwind-compatible classes for red error styling
    });
  }


    // NEW: alertInfo - Shows informational messages with blue/info styling
  alertInfo(text: string): void {
    this._snackBar.open(text, "X", {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 4000, // Slightly longer than success to ensure user notices
      panelClass: ["snackbar-info", "login-snackbar"],
    });
  }

  // OPTIONAL: alertWarning - Shows warning messages with yellow/warning styling
  alertWarning(text: string): void {
    this._snackBar.open(text, "X", {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      duration: 5000, // Longer duration for warnings
      panelClass: ["snackbar-warning", "login-snackbar"],
    });
  }
}
