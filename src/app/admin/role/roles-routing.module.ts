import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guard/auth.guard';
import { RolesComponent }     from './roles.component/roles.component';
import { AddRolesComponent }  from './add-roles.component/add-roles.component';
import { ViewRolesComponent } from './view-roles.component/view-roles.component';

const routes: Routes = [
  { path: '',           component: RolesComponent,    canActivate: [AuthGuard] },
  { path: 'add',        component: AddRolesComponent,  canActivate: [AuthGuard] },
  { path: 'view/:id',   component: ViewRolesComponent, canActivate: [AuthGuard] },
  { path: 'edit/:id',   component: AddRolesComponent,  canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RolesRoutingModule {}
