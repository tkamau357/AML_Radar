import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RolesRoutingModule }  from './roles-routing.module';
import { SharedModule }        from '../../shared/shared.module';
import { ComponentsModule }    from '../../shared/components/components.module';
import { RolesComponent }      from './roles.component/roles.component';
import { AddRolesComponent }   from './add-roles.component/add-roles.component';
import { ViewRolesComponent }  from './view-roles.component/view-roles.component';

@NgModule({
  declarations: [
    RolesComponent,
    AddRolesComponent,
    ViewRolesComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RolesRoutingModule,
    SharedModule,
    ComponentsModule,
    MatIconModule,
    MatTooltipModule,
  ],
})
export class RolesModule {}
