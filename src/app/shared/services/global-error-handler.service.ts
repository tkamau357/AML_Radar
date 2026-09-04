import { ErrorHandler, Injectable, NgZone, Injector } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { LoadingService } from "../../core/service/loading.service";
import { NotificationToastService } from "../../data/services/notification-toast.service";

/**
 * Global error handler that catches all uncaught errors.
 * 
 * Key responsibilities:
 * 1. Reset loading state on any uncaught error (prevents stuck spinners)
 * 2. Display user-friendly error messages
 * 3. Log errors for debugging
 */
@Injectable({
  providedIn: "root",
})
export class GlobalErrorHandlerService extends ErrorHandler {
  // Use Injector to avoid circular dependency with LoadingService
  private _loadingService?: LoadingService;
  
  constructor(
    private dialog: MatDialog, 
    private ngZone: NgZone, 
    private snackBarService: NotificationToastService,
    private injector: Injector
  ) {
    super();
  }

  private get loadingService(): LoadingService {
    if (!this._loadingService) {
      this._loadingService = this.injector.get(LoadingService);
    }
    return this._loadingService;
  }

  override handleError(error: any) {
    // ALWAYS reset loading state on any error - this is the safety net
    this.ngZone.run(() => {
      this.loadingService.reset();
    });

    // Log the error for debugging
    console.error('[GlobalErrorHandler] Uncaught error:', error);

    // Handle custom error types
    if (error && error.name === 'error') {
      this.ngZone.run(() => {
        this.snackBarService.alertError(error.message);
      });
    } else if (error && error.name === 'success') {
      this.ngZone.run(() => {
        this.snackBarService.alertSuccess(error.message);
      });
    } else if (error?.rejection) {
      // Unhandled promise rejection
      const message = error.rejection?.message || error.rejection?.error?.message || 'An unexpected error occurred';
      this.ngZone.run(() => {
        this.snackBarService.alertError(message);
      });
    } else if (error?.message && !error.message.includes('ExpressionChangedAfterItHasBeenCheckedError')) {
      // Skip Angular's dev mode change detection errors
      // but show other meaningful error messages
      if (error.status === 0) {
        this.ngZone.run(() => {
          this.snackBarService.alertError('Unable to connect to server. Please check your network connection.');
        });
      }
    }

    // Call the default error handler (logs to console)
    super.handleError(error);
  }
}
