import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

const routes: Routes = [
  {
    path: "dashboard",
    loadChildren: () =>
      import("./dashboard/dashboard.module").then(
        (m) => m.AdminDashboardModule
      ),
  },
  {
    path: "user-management/roles",
    loadChildren: () =>
      import("./role/roles.module").then((m) => m.RolesModule),
  },
  {
    path: "user-management/users",
    loadChildren: () =>
      import("./user/users.module").then((m) => m.UsersModule),
  },
  {
    path: "user-management/branches",
    loadChildren: () =>
      import("./branch/branch.module").then((m) => m.BranchModule),
  },
  {
    path: "audit",
    loadChildren: () =>
      import("./audit/audit.module").then((m) => m.AuditModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
