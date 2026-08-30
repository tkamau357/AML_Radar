
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { Page404Component } from "../../authentication/page404/page404.component";
import { AuditingComponent } from "./auditing/components/auditing/auditing.component";
import { AuthGuard } from "../../core/guard/auth.guard";
import { PermissionsReference } from "../../data/types/permissions-reference";

const Permissions = PermissionsReference;

const routes: Routes = [
  {
    path: "audit-trail",
    component: AuditingComponent,
    canActivate: [AuthGuard],
    data: { permissions: [Permissions.AUDIT_VIEW] },

  },

  { path: "**", component: Page404Component },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule { }