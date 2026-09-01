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
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { NgApexchartsModule } from 'ng-apexcharts';
import { FeatherIconsModule } from '../../shared/feather-icons.module';

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
    NgApexchartsModule,
    FeatherIconsModule,
    MatButtonModule,
    MatMenuModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatCheckboxModule,
    MatRadioModule,
    MatProgressBarModule,
  ],
})
export class UsersModule {}
