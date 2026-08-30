import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guard/auth.guard';
import { UsersComponent }     from './users.component/users.component';
import { AddUsersComponent }  from './add-users.component/add-users.component';
import { ViewUsersComponent } from './view-users.component/view-users.component';

const routes: Routes = [
  { path: '',           component: UsersComponent,    canActivate: [AuthGuard] },
  { path: 'add',        component: AddUsersComponent,  canActivate: [AuthGuard] },
  { path: 'view/:id',   component: ViewUsersComponent, canActivate: [AuthGuard] },
  { path: 'edit/:id',   component: AddUsersComponent,  canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
