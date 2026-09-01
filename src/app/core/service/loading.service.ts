import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

/**
 * Centralized loading state service.
 * 
 * Usage:
 * - Components call `loadingService.show()` before API calls
 * - Components call `loadingService.hide()` after API calls complete
 * - DynamicTablesComponent subscribes to `loading$` via async pipe
 * 
 * The service includes:
 * - Reference counting for nested loading states
 * - Debounce to prevent flicker on fast API responses
 * - Minimum display time to ensure loading indicator is visible
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  
  private loadingCount = 0;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  
  // Minimum time to show loading indicator (prevents flicker)
  private readonly MIN_LOADING_TIME_MS = 200;
  private loadingStartTime: number | null = null;

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

  /**
   * Start loading state.
   * Can be called multiple times (reference counted).
   */
  show(): void {
    this.loadingCount++;
    if (this.loadingCount === 1) {
      this.loadingStartTime = Date.now();
      this.loadingSubject.next(true);
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
   * Use sparingly - mainly for error recovery.
   */
  reset(): void {
    this.loadingCount = 0;
    this.loadingStartTime = null;
    this.loadingSubject.next(false);
  }

  /**
   * Get current loading state synchronously.
   */
  get isLoading(): boolean {
    return this.loadingSubject.value;
  }

  /**
   * Wrap an observable to automatically show/hide loading.
   * 
   * Usage:
   * ```
   * this.loadingService.wrap(this.http.get('/api/data')).subscribe(...)
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

      return () => {
        subscription.unsubscribe();
        // Don't auto-hide on unsubscribe - let the component handle it
      };
    });
  }
}
