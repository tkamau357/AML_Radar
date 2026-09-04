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
    path: "sanctions",
    loadChildren: () =>
      import("./sanctions/sanctions.module").then((m) => m.SanctionsModule),
  },
  {
    path: "assessments/alerts",
    loadChildren: () =>
      import("./alerts/alerts.module").then((m) => m.AlertsModule),
  },
  {
    path: "assessments/case",
    loadChildren: () =>
      import("./case/case.module").then((m) => m.CaseModule),
  },
  {
    path: "assessments/rules",
    loadChildren: () =>
      import("./rules/rules.module").then((m) => m.RulesModule),
  },
  {
    path: "assessments/screening",
    loadChildren: () =>
      import("./screening/screening.module").then((m) => m.ScreeningModule),
  },
  {
    path: "assessments/transactions",
    loadChildren: () =>
      import("./transactions/transactions.module").then((m) => m.TransactionsModule),
  },
  {
    path: "role-management/roles",
    loadChildren: () =>
      import("./role/roles.module").then((m) => m.RolesModule),
  },
  {
    path: "user-management/users",
    loadChildren: () =>
      import("./user/users.module").then((m) => m.UsersModule),
  },
  {
    path: "configurations/branches",
    loadChildren: () =>
      import("./branch/branch.module").then((m) => m.BranchModule),
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
