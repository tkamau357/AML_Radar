import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guard/auth.guard';
import { AddRules } from './add-rules/add-rules';
import { Rules } from './rules/rules';
import { ViewRules } from './view-rules/view-rules';
import { EngineConfig } from './engine-config/engine-config';

const routes: Routes = [
  { path: '', component: Rules, canActivate: [AuthGuard] },
  { path: 'add', component: AddRules, canActivate: [AuthGuard] },
  { path: 'view/:id', component: ViewRules, canActivate: [AuthGuard] },
  { path: 'edit/:id', component: AddRules, canActivate: [AuthGuard] },
  { path: 'config', component: EngineConfig, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RulesRoutingModule {}