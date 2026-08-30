import { NgModule } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
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
import { NgChartsModule } from "ng2-charts";
import { NgApexchartsModule } from "ng-apexcharts";
import {
  Activity, AlertCircle, ArrowRight, BarChart2, ChartPie,
  CheckCircle, CircleCheck, Clock, Cpu, Database, Globe,
  HardDrive, Landmark, Layers, LayoutDashboard, LucideAngularModule,
  Mail, OctagonAlert, RefreshCw, ScrollText, Server,
  ShieldCheck, Tags, TrendingUp, TriangleAlert
} from "lucide-angular";
import { DashboardRoutingModule } from "./dashboard-routing.module";
import { ComponentsModule } from "../../shared/components/components.module";
import { FeatherIconsModule } from "../../shared/feather-icons.module";
import { SharedModule } from "../../shared/shared.module";
import { Dashboard } from "./dashboard";

@NgModule({
  declarations: [
    Dashboard,
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MatIconModule,
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
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatCheckboxModule,
    MatRadioModule,
    NgChartsModule,
    NgApexchartsModule,
    FeatherIconsModule,
    LucideAngularModule.pick({
      Activity, AlertCircle, ArrowRight, BarChart2, ChartPie,
      CheckCircle, CircleCheck, Clock, Cpu, Database, Globe,
      HardDrive, Landmark, Layers, LayoutDashboard,
      Mail, OctagonAlert, RefreshCw, ScrollText, Server,
      ShieldCheck, Tags, TrendingUp, TriangleAlert
    }),
  ],
  providers: [DatePipe]
})
export class DashboardModule { }
