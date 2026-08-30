import { CdkColumnDef } from "@angular/cdk/table";
import { CommonModule, DatePipe } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MatTabsModule } from "@angular/material/tabs";
import { MatTooltipModule } from "@angular/material/tooltip";
import { NgApexchartsModule } from "ng-apexcharts";
import { SharedModule } from "../../shared/shared.module";
import { DashboardRoutingModule } from "./dashboard-routing.module";
import { AuditingComponent } from "./auditing/components/auditing/auditing.component";
import { MatChipsModule } from '@angular/material/chips';
// import { TranslateModule } from "@ngx-translate/core";
import { Activity, AlertCircle, BarChart2, CheckCircle, Clock, Cpu, Database, Globe, HardDrive, LucideAngularModule, Mail, RefreshCw, Server, TrendingUp, XCircle, Zap } from "lucide-angular";
import { FormsModule } from "@angular/forms";
import { FeatherIconsModule } from "../../shared/feather-icons.module";
import { ComponentsModule } from "../../shared/components/components.module";


@NgModule({
  declarations: [
    AuditingComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatChipsModule,
    DashboardRoutingModule,
    NgApexchartsModule,
    MatIconModule,
    FeatherIconsModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    MatProgressBarModule,
    ComponentsModule,
    SharedModule,
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
    CommonModule,
    LucideAngularModule.pick({ 
      Activity, Database, Mail, HardDrive, Cpu, Clock, 
      TrendingUp, Globe, AlertCircle, CheckCircle, XCircle, 
      RefreshCw, Zap, Server, BarChart2 
    })
  ],
  providers: [CdkColumnDef, DatePipe],
  exports: [LucideAngularModule]  
})
export class AdminDashboardModule { }
