import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BranchComponent } from './branch.component/branch.component';
import { AuthGuard } from '../../core/guard/auth.guard';
import { AddBranchComponent } from './add-branch-component/add-branch-component';
import { ViewBranchComponent } from './view-branch-component/view-branch-component';

const routes: Routes = [
  { path: '',           component: BranchComponent,    canActivate: [AuthGuard] },
    { path: 'add',        component: AddBranchComponent,  canActivate: [AuthGuard] },
    { path: 'view/:code',   component: ViewBranchComponent, canActivate: [AuthGuard] },
    { path: 'edit/:code',   component: AddBranchComponent,  canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BranchRoutingModule {}
