import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { DirectionService } from '../../core/service/direction.service';
import { SidebarStateService } from '../sidebar/sidebar-state.service';

@Component({
  selector: 'app-full-layout',
  standalone: false,
  templateUrl: './full-layout.html',
  styleUrl: './full-layout.scss',
})
export class FullLayout implements OnInit, OnDestroy {
  direction: string = 'ltr';
  isSidebarCollapsed = false;
  public config: any = {};

  private subs: Subscription[] = [];

  constructor(
    private directoryService: DirectionService,
    private sidebarStateService: SidebarStateService,
  ) {
    this.subs.push(
      this.directoryService.currentData.subscribe((currentData) => {
        if (currentData) {
          this.direction = currentData;
        } else {
          const stored = sessionStorage.getItem('isRtl');
          if (stored === 'true') {
            this.direction = 'rtl';
          } else if (stored === 'false') {
            this.direction = 'ltr';
          } else {
            this.direction = this.config?.layout?.rtl === true ? 'rtl' : 'ltr';
          }
        }
      })
    );
  }

  ngOnInit(): void {
    this.subs.push(
      this.sidebarStateService.isCollapsed$.subscribe((collapsed) => {
        this.isSidebarCollapsed = collapsed;
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
