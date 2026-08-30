// src/app/authentication/sidebar/sidebar.component.ts
import { Router, NavigationEnd } from "@angular/router";
import { DOCUMENT } from "@angular/common";
import {
  Component,
  Inject,
  ElementRef,
  OnInit,
  Renderer2,
  HostListener,
  OnDestroy,
} from "@angular/core";
import { Subscription } from "rxjs";
import { RouteInfo } from "./sidebar.metadata";
import { TokenStorageService } from "../../core/service/token-storage.service";
import { SidebarStateService } from "./sidebar-state.service";
import { ROUTES } from "./sidebar-items";

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
  standalone: false,
})
export class SidebarComponent implements OnInit, OnDestroy {
  public sidebarItems: RouteInfo[] = [];
  public filteredSidebarItems: RouteInfo[] = [];

  level1Menu = "";
  level2Menu = "";
  level3Menu = "";
  sidebarSearchTerm = "";

  public innerHeight: number = 0;
  public bodyTag: HTMLElement | null = null;

  listMaxHeight: string = "";
  listMaxWidth: string = "";
  userFullName: string = "";
  userImg: string = "assets/images/logo1.png";
  userType: string = "";
  headerHeight = 60;
  currentRoute: string = "";
  routerObj: Subscription | null = null;
  country_found: boolean = false;
  window = window;

  currentUser: any = null;
  exported_Route: RouteInfo | null = null;
  received_Subsidiary: string = "";
  dashboardPage: string = "";

  private tourExpandSub: Subscription | null = null;
  private tourResetSub: Subscription | null = null;

  get isSidebarCollapsed(): boolean {
    return this.sidebarStateService.isCollapsed;
  }
  set isSidebarCollapsed(value: boolean) {
    this.sidebarStateService.setCollapsed(value);
  }

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public elementRef: ElementRef,
    private router: Router,
    private tokenStorageService: TokenStorageService,
    private sidebarStateService: SidebarStateService
  ) {
    const body = this.elementRef.nativeElement.closest("body");
    this.routerObj = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const role = ["ROLE_ADMIN", "ROLE_CLERK"];
        const currenturl = event.url.split("?")[0];
        const firstString = currenturl.split("/").slice(1)[0];

        if (role.indexOf(firstString) !== -1) {
          this.level1Menu = event.url.split("/")[2];
          this.level2Menu = event.url.split("/")[3];
        } else {
          this.level1Menu = event.url.split("/")[1];
          this.level2Menu = event.url.split("/")[2];
        }

        if (window.innerWidth < 1024) {
          this.isSidebarCollapsed = true;
        }

        this.renderer.removeClass(this.document.body, "overlay-open");
      }
    });
  }

  ngAfterViewInit() {
    const sidebarNav = this.elementRef.nativeElement.querySelector(".sidebar-scroll");
    let scrollTimeout: any;

    if (sidebarNav) {
      sidebarNav.addEventListener("scroll", () => {
        sidebarNav.classList.add("scrolling");

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          sidebarNav.classList.remove("scrolling");
        }, 800);
      });
    }
  }

  @HostListener('window:resize')
  onResize() {
    const isDesktop = window.innerWidth >= 1024;

    if (isDesktop) {
      this.isSidebarCollapsed = false;
    } else {
      this.isSidebarCollapsed = true;
    }
  }

  @HostListener("document:mousedown", ["$event"])
  onGlobalClick(event: any): void {
    if (
      !this.isSidebarCollapsed &&
      window.innerWidth < 1024 &&
      !this.elementRef.nativeElement.contains(event.target)
    ) {
      const header = this.document.querySelector('app-header');
      if (!header?.contains(event.target)) {
        this.isSidebarCollapsed = true;
      }
    }

    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.renderer.removeClass(this.document.body, "overlay-open");
    }
  }

  callLevel1Toggle(event: any, element: any) {
    if (element === this.level1Menu) {
      this.level1Menu = "0";
    } else {
      this.level1Menu = element;
    }
    const hasClass = event.target.classList.contains("toggled");
    if (hasClass) {
      this.renderer.removeClass(event.target, "toggled");
    } else {
      this.renderer.addClass(event.target, "toggled");
    }
  }

  callLevel2Toggle(event: any, element: any) {
    if (element === this.level2Menu) {
      this.level2Menu = "0";
    } else {
      this.level2Menu = element;
    }
  }

  callLevel3Toggle(event: any, element: any) {
    if (element === this.level3Menu) {
      this.level3Menu = "0";
    } else {
      this.level3Menu = element;
    }
  }

  canView(route: RouteInfo): boolean {
    // Implement permission logic here if needed
    return true;
  }

  ngOnInit() {
    this.currentUser = this.tokenStorageService.getUser();

    // ✅ Load routes from sidebar-items.ts
    this.sidebarItems = [...ROUTES];
    this.filteredSidebarItems = [...this.sidebarItems];

    if (this.currentUser) {
      this.userFullName = this.currentUser.username || this.currentUser.email;
      this.userImg = "assets/images/logo1.png";
    }

    this.bodyTag = this.document.body;
    this.initLeftSidebar();
    this.initializeSidebarState();
  }

  onSidebarSearch(term: string): void {
    this.sidebarSearchTerm = String(term || "").trim();
    this.filteredSidebarItems = this.filterSidebarItemsBySearch(this.sidebarItems, this.sidebarSearchTerm);
  }

  clearSidebarSearch(): void {
    this.onSidebarSearch("");
  }

  isSearchActive(): boolean {
    return this.sidebarSearchTerm.length > 0;
  }

  hasChildren(route?: RouteInfo): boolean {
    return Array.isArray(route?.submenu) && route!.submenu!.length > 0;
  }

  isLevel1Expanded(route: RouteInfo): boolean {
    return this.isSearchActive() || this.level1Menu === route.moduleName;
  }

  isLevel2Expanded(route: RouteInfo): boolean {
    return this.isSearchActive() || this.level2Menu === route.moduleName;
  }

  private filterSidebarItemsBySearch(items: RouteInfo[], term: string): RouteInfo[] {
    if (!term) {
      return [...items];
    }

    const normalizedTerm = term.toLowerCase();
    const results: RouteInfo[] = [];
    let pendingGroup: RouteInfo | null = null;

    for (const item of items) {
      if (item.groupTitle) {
        pendingGroup = item;
        continue;
      }

      const matchedItem = this.filterRouteItemBySearch(item, normalizedTerm);
      if (!matchedItem) {
        continue;
      }

      if (pendingGroup) {
        results.push(pendingGroup);
        pendingGroup = null;
      }

      results.push(matchedItem);
    }

    return results;
  }

  private filterRouteItemBySearch(item: RouteInfo, normalizedTerm: string): RouteInfo | null {
    const title = (item.title || "").toLowerCase();
    const moduleName = (item.moduleName || "").toLowerCase();
    const path = (item.path || "").toLowerCase();
    const directMatch = title.includes(normalizedTerm)
      || moduleName.includes(normalizedTerm)
      || path.includes(normalizedTerm);

    const children = Array.isArray(item.submenu) ? item.submenu : [];
    const filteredChildren = children
      .map((child) => this.filterRouteItemBySearch(child, normalizedTerm))
      .filter((child): child is RouteInfo => !!child);

    if (directMatch || filteredChildren.length > 0) {
      return {
        ...item,
        submenu: filteredChildren.length > 0 ? filteredChildren : children,
      };
    }

    return null;
  }

  initializeSidebarState() {
    const isDesktop = window.innerWidth >= 1024;

    if (isDesktop) {
      this.isSidebarCollapsed = false;
      localStorage.setItem('sidebar_status', 'open');
    } else {
      this.isSidebarCollapsed = true;
      localStorage.setItem('sidebar_status', 'close');
    }
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    localStorage.setItem('sidebar_status', this.isSidebarCollapsed ? 'close' : 'open');
  }

  resetForTour(): void {
    this.level1Menu = "0";
    this.level2Menu = "0";
    this.level3Menu = "0";

    this.sidebarSearchTerm = "";
    this.filteredSidebarItems = [...this.sidebarItems];

    const sidebarNav = this.elementRef.nativeElement.querySelector('.sidebar-scroll');
    if (sidebarNav) {
      sidebarNav.scrollTo({ top: 0, behavior: 'auto' });
    }
  }

  ngOnDestroy() {
    this.routerObj?.unsubscribe();
    this.tourExpandSub?.unsubscribe();
    this.tourResetSub?.unsubscribe();
  }

  initLeftSidebar() {
    const _this = this;
    _this.setMenuHeight();
    _this.checkStatuForResize(true);
  }

  setMenuHeight() {
    this.innerHeight = window.innerHeight;
    const height = this.innerHeight - this.headerHeight;
    this.listMaxHeight = height + "";
    this.listMaxWidth = "500px";
  }

  isOpen(): boolean {
    return this.bodyTag?.classList.contains("overlay-open") ?? false;
  }

  checkStatuForResize(firstTime: boolean) {
    if (window.innerWidth < 1170) {
      this.renderer.addClass(this.document.body, "ls-closed");
    } else {
      this.renderer.removeClass(this.document.body, "ls-closed");
    }
  }

  isLoggingOut = false;

  logout(): void {
    if (this.isLoggingOut) return;
    this.isLoggingOut = true;
    this.tokenStorageService.clearSession();
    this.router.navigate(['/auth/sign-in']);
  }

  backToDashboard() {
    this.router.navigate(["/recon-dashboard/home"]);
  }
}