import { ErrorHandler, Injectable, NgZone } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { SnackbarService } from "./snackbar.service";

@Injectable({
  providedIn: "root",
})
export class GlobalErrorHandlerService extends ErrorHandler {
  constructor(private dialog: MatDialog, private ngZone: NgZone, private snackBarService: SnackbarService) {
    super();
  }

  override handleError(error: Error) {
    if(error && error.name === 'error'){
      this.snackBarService.alertError(error.message);
    }else if (error && error.name === 'success') {
      this.snackBarService.alertSuccess(error.message);
    }
    // if ( error && error.name === "error" || error.name === "success") {
    //   this.ngZone.run(() => {
    //     const data: NotificationDialogData = {
    //       message: error.message,
    //       status: error.name == "error" ? "error" : "success",
    //       buttonText: error.name == "error" ? "Cancel" : "Ok",
    //       icon: "error",
    //     };
    //     this.dialog.open(NotificationDialogComponent, {
    //       data,
    //       maxWidth: "500px"
    //     });
    //   });
    // } 
  }
}
