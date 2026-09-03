import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guard/auth.guard';
import { AddCase } from './add-case/add-case';
import { Case } from './case/case';
import { ViewCase } from './view-case/view-case';

const routes: Routes = [
  { path: '', redirectTo: 'entries', pathMatch: 'full' },
  { path: 'case', component: Case, canActivate: [AuthGuard] },
  { path: 'add', component: AddCase, canActivate: [AuthGuard] },
  { path: 'view/:id', component: ViewCase, canActivate: [AuthGuard] },
  { path: 'edit/:id', component: AddCase, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CaseRoutingModule {}