import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UsersRoutingModule }  from './users-routing.module';
import { SharedModule }        from '../../shared/shared.module';
import { ComponentsModule }    from '../../shared/components/components.module';
import { UsersComponent }      from './users.component/users.component';
import { AddUsersComponent }   from './add-users.component/add-users.component';
import { ViewUsersComponent }  from './view-users.component/view-users.component';

@NgModule({
  declarations: [
    UsersComponent,
    AddUsersComponent,
    ViewUsersComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UsersRoutingModule,
    SharedModule,
    ComponentsModule,
    MatIconModule,
    MatTooltipModule,
  ],
})
export class UsersModule {}
