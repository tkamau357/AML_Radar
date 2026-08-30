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
  ],
  providers: [CdkColumnDef, DatePipe],
})
export class AdminModule {}
