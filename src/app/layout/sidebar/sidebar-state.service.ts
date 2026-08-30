import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({ providedIn: "root" })
export class SidebarStateService {
  private collapsedSubject = new BehaviorSubject<boolean>(false);
  isCollapsed$ = this.collapsedSubject.asObservable();

  get isCollapsed(): boolean {
    return this.collapsedSubject.value;
  }

  setCollapsed(value: boolean): void {
    this.collapsedSubject.next(value);
  }

  toggle(): void {
    this.collapsedSubject.next(!this.collapsedSubject.value);
  }
}
