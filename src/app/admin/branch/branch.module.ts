import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BranchRoutingModule } from './branch-routing.module';
import { BranchComponent } from './branch.component/branch.component';
import { ComponentsModule } from '../../shared/components/components.module';
import { SharedModule } from '../../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AddBranchComponent } from './add-branch-component/add-branch-component';
import { ViewBranchComponent } from './view-branch-component/view-branch-component';

@NgModule({
  declarations: [
    BranchComponent,
    AddBranchComponent,
    ViewBranchComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BranchRoutingModule,
    SharedModule,
    ComponentsModule,
    MatIconModule,
    MatTooltipModule,
  ],
})
export class BranchModule {}
