import { DOCUMENT } from "@angular/common";
import {
  Component,
  Inject,
  ElementRef,
  OnInit,
  Renderer2,
  AfterViewInit,
  OnDestroy,
} from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { filter } from "rxjs/operators";
import { AuthService } from "../../core/service/auth.service";
import { LanguageService } from "../../core/service/language.service";
import { TokenStorageService } from "../../core/service/token-storage.service";
import { UnsubscribeOnDestroyAdapter } from "../../shared/UnsubscribeOnDestroyAdapter";
import { SidebarStateService } from "../sidebar/sidebar-state.service";
import { NotificationToastService } from "../../data/services/notification-toast.service";

const document: any = window.document;

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
  standalone: false,
})
export class HeaderComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit, AfterViewInit, OnDestroy
{
  public config: any = {};
  isNavbarCollapsed = false;
  isFullscreen: boolean = false;
  subsidiary: any;
  userImg: string = "";
  homePage: string = "";
  dashboardPage: string = "";
  langStoreValue: string = "";
  defaultFlag: string = "";
  isOpenSidebar: boolean = false;
  firstName: string = "";
  lastName: string = "";
  email: string = "";
  isHomePage: boolean = false;
  isReconDashboardHome: boolean = false;

  isNotifOpen: boolean = false;
  notifTab: 'all' | 'unread' = 'all';
  notifications: Notification[] = [];
  unreadCount: number = 0;
  selectedNotification: Notification | null = null;

  // Profile dropdown
  isProfileMenuOpen: boolean = false;
  currentUserId: number | null = null;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public elementRef: ElementRef,
    private authService: AuthService,
    private router: Router,
    public languageService: LanguageService,
    private tokenStorage: TokenStorageService,
    public notificationService: NotificationToastService,
    public sidebarStateService: SidebarStateService
  ) {
    super();
  }

  ngOnInit() {
    this.subs.sink = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.checkIfHomePage(event.url);
        this.checkIfCurrentPageIsHome(event.url);
      });

    this.checkIfHomePage(this.router.url);
    this.checkIfCurrentPageIsHome(this.router.url);

    const currentUser = this.tokenStorage.getUser();
    this.firstName = currentUser.firstName ?? "";
    this.lastName = currentUser.lastName ?? "";
    this.email = currentUser.email ?? "";

    this.userImg = "assets/images/user/profile_img.png";

    this.homePage = "admin/dashboard";
    this.dashboardPage = "home/dashboard-home";
  }

  ngAfterViewInit() {
    const theme = sessionStorage.getItem("theme");
    if (theme) {
      this.renderer.removeClass(this.document.body, this.config.layout.variant);
      this.renderer.addClass(this.document.body, theme);
    } else {
      this.renderer.addClass(this.document.body, this.config.layout.variant);
    }

    const menuOption = sessionStorage.getItem("menuOption");
    if (menuOption) {
      this.renderer.addClass(this.document.body, menuOption);
    } else {
      this.renderer.addClass(this.document.body, "menu_" + this.config.layout.sidebar.backgroundColor);
    }

    const logoHeader = sessionStorage.getItem("choose_logoheader");
    if (logoHeader) {
      this.renderer.addClass(this.document.body, logoHeader);
    } else {
      this.renderer.addClass(this.document.body, "logo-" + this.config.layout.logo_bg_color);
    }
  }

  checkIfHomePage(url: string): void {
    this.isReconDashboardHome = url === "/" || url === "/home" || url.includes("/recon-dashboard/home");
  }

  checkIfCurrentPageIsHome(url: string): void {
    this.isHomePage = url === "/recon-dashboard/home" || url.endsWith("/home");
  }

  callFullscreen() {
    if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
      this.isFullscreen = true;
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        document.documentElement.msRequestFullscreen();
      } else if (document.documentElement.mozRequestFullScreen) {
        document.documentElement.mozRequestFullScreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        document.documentElement.webkitRequestFullscreen();
      }
    } else {
      this.isFullscreen = false;
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  mobileMenuSidebarOpen(event: any, className: string) {
    const hasClass = event.target.classList.contains(className);
    if (hasClass) {
      this.renderer.removeClass(this.document.body, className);
    } else {
      this.renderer.addClass(this.document.body, className);
    }
  }

  callSidemenuCollapse() {
    this.sidebarStateService.toggle();
  }

  toggleNavbar(): void {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(["/authentication/signin"]);
  }

  toSettings() {
    this.router.navigate(["/admin/users/settings"]);
  }

  backToDashboard() {
    this.router.navigate(["/recon-dashboard/home"]);
  }

  toProfile() {
    this.router.navigate(["/change-password"]);
  }

  closeDetail(): void {
    this.selectedNotification = null;
  }

  closePanel(): void {
    this.isNotifOpen = false;
    this.selectedNotification = null;
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }

  viewProfile(): void {
    this.closeProfileMenu();
    if (this.currentUserId != null) {
      this.router.navigate(['/admin/user-accounts/view-account', this.currentUserId]);
    } else {
      console.warn('No user id in session — cannot navigate to profile.');
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}