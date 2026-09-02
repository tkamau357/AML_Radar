import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

/**
 * Centralized loading state service with automatic HTTP integration.
 * 
 * This service is automatically used by the HttpInterceptor to show/hide loading
 * for all HTTP requests. Components no longer need to manually manage loading state.
 * 
 * Features:
 * - Automatic loading for all HTTP requests (via HttpInterceptor)
 * - Reference counting for nested/parallel requests
 * - Debounce to prevent flicker on fast responses
 * - Minimum display time to ensure loading is visible
 * - Auto-reset on route navigation (safety net)
 * - Manual reset for error recovery
 * 
 * Usage in DynamicTablesComponent:
 * - Set [useGlobalLoading]="true" to automatically use this service
 * - Or bind [loading$]="loadingService.loading$" directly
 * 
 * For components that need custom loading behavior:
 * - Add header 'X-Skip-Loading': 'true' to HTTP requests to skip global loading
 * - Use local isLoading boolean for component-specific loading states
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  
  private loadingCount = 0;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  
  // Minimum time to show loading indicator (prevents flicker)
  private readonly MIN_LOADING_TIME_MS = 300;
  private loadingStartTime: number | null = null;
  
  // Timeout for auto-reset (safety net - reset after 30 seconds max)
  private readonly MAX_LOADING_TIME_MS = 30000;
  private autoResetTimeout: any = null;

  /**
   * Observable for loading state.
   * Debounced to prevent rapid true/false transitions.
   */
  readonly loading$: Observable<boolean> = this.loadingSubject.asObservable().pipe(
    debounceTime(50), // Small debounce to batch rapid changes
    distinctUntilChanged()
  );

  /**
   * Raw loading state without debounce (for immediate checks)
   */
  readonly loadingImmediate$: Observable<boolean> = this.loadingSubject.asObservable();

  constructor(private router: Router) {
    // Reset loading on navigation start (safety net for stuck loaders)
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        // Give a small delay to allow current operations to complete
        setTimeout(() => {
          if (this.loadingCount > 0) {
            console.warn('[LoadingService] Resetting stuck loading state on navigation');
            this.reset();
          }
        }, 100);
      }
    });
  }

  /**
   * Start loading state.
   * Can be called multiple times (reference counted).
   */
  show(): void {
    this.loadingCount++;
    
    if (this.loadingCount === 1) {
      this.loadingStartTime = Date.now();
      this.loadingSubject.next(true);
      
      // Setup auto-reset timeout (safety net)
      this.clearAutoResetTimeout();
      this.autoResetTimeout = setTimeout(() => {
        if (this.loadingCount > 0) {
          console.warn('[LoadingService] Auto-resetting loading state after timeout');
          this.reset();
        }
      }, this.MAX_LOADING_TIME_MS);
    }
  }

  /**
   * End loading state.
   * Loading indicator hides when count reaches 0.
   * Enforces minimum display time to prevent flicker.
   */
  hide(): void {
    if (this.loadingCount > 0) {
      this.loadingCount--;
    }

    if (this.loadingCount === 0) {
      this.clearAutoResetTimeout();
      
      const elapsed = this.loadingStartTime ? Date.now() - this.loadingStartTime : this.MIN_LOADING_TIME_MS;
      const remaining = Math.max(0, this.MIN_LOADING_TIME_MS - elapsed);

      if (remaining > 0) {
        // Delay hiding to meet minimum display time
        setTimeout(() => {
          if (this.loadingCount === 0) {
            this.loadingSubject.next(false);
            this.loadingStartTime = null;
          }
        }, remaining);
      } else {
        this.loadingSubject.next(false);
        this.loadingStartTime = null;
      }
    }
  }

  /**
   * Force reset loading state.
   * Use for error recovery or when navigation occurs.
   */
  reset(): void {
    this.loadingCount = 0;
    this.loadingStartTime = null;
    this.clearAutoResetTimeout();
    this.loadingSubject.next(false);
  }

  /**
   * Get current loading state synchronously.
   */
  get isLoading(): boolean {
    return this.loadingSubject.value;
  }

  /**
   * Get current pending request count (for debugging)
   */
  get pendingCount(): number {
    return this.loadingCount;
  }

  private clearAutoResetTimeout(): void {
    if (this.autoResetTimeout) {
      clearTimeout(this.autoResetTimeout);
      this.autoResetTimeout = null;
    }
  }

  /**
   * Wrap an observable to automatically show/hide loading.
   * Useful for non-HTTP operations that need loading state.
   * 
   * Usage:
   * ```
   * this.loadingService.wrap(this.someService.doSomething()).subscribe(...)
   * ```
   */
  wrap<T>(source$: Observable<T>): Observable<T> {
    return new Observable<T>(observer => {
      this.show();
      
      const subscription = source$.subscribe({
        next: (value) => observer.next(value),
        error: (err) => {
          this.hide();
          observer.error(err);
        },
        complete: () => {
          this.hide();
          observer.complete();
        }
      });

      // Handle unsubscription
      return () => {
        subscription.unsubscribe();
        this.hide();
      };
    });
  }
}
