import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guard/auth.guard';
import { AddAlerts } from './add-alerts/add-alerts';
import { Alerts } from './alerts/alerts';
import { ViewAlerts } from './view-alerts/view-alerts';

const routes: Routes = [
  { path: '', component: Alerts, canActivate: [AuthGuard] },
  { path: 'add', component: AddAlerts, canActivate: [AuthGuard] },
  { path: 'view/:id', component: ViewAlerts, canActivate: [AuthGuard] },
  { path: 'edit/:id', component: AddAlerts, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AlertsRoutingModule {}
