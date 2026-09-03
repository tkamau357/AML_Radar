import { CdkColumnDef } from "@angular/cdk/table";
import { CommonModule, DatePipe } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatRadioModule } from "@angular/material/radio";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MatTabsModule } from "@angular/material/tabs";
import { ComponentsModule } from "../shared/components/components.module";
import { SharedModule } from "../shared/shared.module";
import { AdminRoutingModule } from "./admin-routing.module";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectModule } from "@angular/material/select";
import { MatTooltipModule } from "@angular/material/tooltip";
import { NgApexchartsModule } from "ng-apexcharts";
import { FeatherIconsModule } from "../shared/feather-icons.module";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule,
    MatIconModule,
    MatTableModule,
    ComponentsModule,
    MatSortModule,
    MatPaginatorModule,
    MatMenuModule,
    MatTabsModule,
    MatDialogModule,
    MatRadioModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    NgApexchartsModule,
    FeatherIconsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatProgressBarModule,
  ],
  providers: [CdkColumnDef, DatePipe],
})
export class AdminModule {}
