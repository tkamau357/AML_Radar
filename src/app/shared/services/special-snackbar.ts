import { Injectable } from "@angular/core";
import { MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition, MatSnackBar } from "@angular/material/snack-bar";
@Injectable({
    providedIn: "root",
  })

export class SpecialSnackbarService {
    horizontalPosition: MatSnackBarHorizontalPosition = "end";
    verticalPosition: MatSnackBarVerticalPosition = "top";
  
    constructor(private _snackBar: MatSnackBar) {}
  
    showNotification(text: any, colorName: any) {
      this._snackBar.open(text, "X", {
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
        duration: 10000,
        panelClass: [colorName, "login-snackbar"],
      });
    }
  
    showErrorNotification(text: any): void{
      this._snackBar.open(text, "X", {
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
        duration: 10000,
        panelClass: ["snackbar-danger", "login-snackbar"],
      });
    }
  
  
    showLongErrorNotification(text: any): void{
      this._snackBar.open(text, "X", {
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
        duration: 10000,
        panelClass: ["snackbar-danger", "login-snackbar"],
      });
    }
}