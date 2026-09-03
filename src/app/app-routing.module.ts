import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { Page404Component } from "./authentication/page404/page404.component";
import { Page403Component } from "./authentication/page403/page403.component";
import { SigninComponent } from "./authentication/signin/signin.component";
import { OtpComponent } from "./authentication/otp/otp.component";
import { ChangePasswordComponent } from "./authentication/change-password/change-password.component";
import { AuthGuard } from "./core/guard/auth.guard";
import { FullLayout } from "./layout/full-layout/full-layout";

const routes: Routes = [
  // === PUBLIC ROUTES (no layout shell) ===
  { path: "auth/sign-in",        component: SigninComponent },
  { path: "auth/verify-otp",     component: OtpComponent },
  { path: "auth/change-password", component: ChangePasswordComponent },
  { path: "auth/unauthorized",   component: Page403Component },
  { path: "", redirectTo: "auth/sign-in", pathMatch: "full" },

  // === PROTECTED ROUTES (inside FullLayout: sidebar + header) ===
  {
    path: "",
    component: FullLayout,
    canActivate: [AuthGuard],
    children: [
      // Dashboard home — lazy-loads DashboardModule which declares Dashboard
      // and registers the child route "home" → Dashboard component
      {
        path: "dashboard",
        loadChildren: () =>
          import("./layout/dashboard/dashboard.module").then(
            (m) => m.DashboardModule
          ),
      },

      // Admin feature routes: roles, users, branches, audit-trail
      {
        path: "admin",
        loadChildren: () =>
          import("./admin/admin.module").then((m) => m.AdminModule),
      },
    ],
  },

  // Wildcard
  { path: "**", component: Page404Component },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      scrollPositionRestoration: "enabled",
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}