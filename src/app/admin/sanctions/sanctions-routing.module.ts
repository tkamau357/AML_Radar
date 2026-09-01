import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../core/guard/auth.guard';
import { SanctionsEntriesComponent } from './sanctions-entries/sanctions-entries-component/sanctions-entries-component';
import { AddSanctionsEntriesComponent } from './sanctions-entries/add-sanctions-entries-component/add-sanctions-entries-component';
import { ViewSanctionsEntriesComponent } from './sanctions-entries/view-sanctions-entries-component/view-sanctions-entries-component';
import { SourceConfigurationComponent } from './source-configuration/source-configuration.component';
import { AddSourceComponent } from './source-configuration/add-source/add-source.component';

const routes: Routes = [
  { path: '', redirectTo: 'entries', pathMatch: 'full' },
  { path: 'entries', component: SanctionsEntriesComponent, canActivate: [AuthGuard] },
  { path: 'entries/add', component: AddSanctionsEntriesComponent, canActivate: [AuthGuard] },
  { path: 'entries/edit/:id', component: AddSanctionsEntriesComponent, canActivate: [AuthGuard] },
  { path: 'entries/view/:id', component: ViewSanctionsEntriesComponent, canActivate: [AuthGuard] },
  { path: 'sources', component: SourceConfigurationComponent, canActivate: [AuthGuard] },
  { path: 'sources/add', component: AddSourceComponent, canActivate: [AuthGuard] },
  { path: 'sources/edit/:source', component: AddSourceComponent, canActivate: [AuthGuard] },
  { path: 'sources/view/:source', component: AddSourceComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SanctionsRoutingModule {}
