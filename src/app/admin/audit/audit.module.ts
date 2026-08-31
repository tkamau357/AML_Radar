import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ComponentsModule } from '../../shared/components/components.module';
import { AuditComponent } from './audit.component/audit.component';

const routes: Routes = [
  { path: '', component: AuditComponent },
];

@NgModule({
  declarations: [AuditComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ComponentsModule,
    RouterModule.forChild(routes),
  ],
})
export class AuditModule {}
