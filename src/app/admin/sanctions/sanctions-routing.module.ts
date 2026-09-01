import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guard/auth.guard';
import { SanctionsEntriesComponent } from './sanctions-entries/sanctions-entries-component/sanctions-entries-component';
import { AddSanctionsEntriesComponent } from './sanctions-entries/add-sanctions-entries-component/add-sanctions-entries-component';
import { ViewSanctionsEntriesComponent } from './sanctions-entries/view-sanctions-entries-component/view-sanctions-entries-component';

const routes: Routes = [
  { path: '', component: SanctionsEntriesComponent, canActivate: [AuthGuard] },
  { path: 'add-entries', component: AddSanctionsEntriesComponent, canActivate: [AuthGuard] },
  { path: 'edit-entries/:id', component: AddSanctionsEntriesComponent, canActivate: [AuthGuard] },
  { path: 'view-entries/:id', component: ViewSanctionsEntriesComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SanctionsRoutingModule {}
