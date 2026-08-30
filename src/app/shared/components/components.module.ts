import { NgModule } from "@angular/core";
import { SharedModule } from "../shared.module";
import { BaseComponent } from "./base/base.component";
import { SpinnerComponent } from "./spinner/spinner.component";
import { MatCardModule } from "@angular/material/card";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { CardComponent } from "./card/card.component";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MaterialModule } from "../material.module";
import { DataIngestionTrendsComponent } from "./data-ingestion-trends/data-ingestion-trends.component";
import { RealtimeNotificationToastComponent } from "./realtime-notification-toast/realtime-notification-toast.component";
import { DynamicTablesComponent } from "./dynamic-tables/dynamic-tables.component";
@NgModule({
  declarations: [
    BaseComponent,
    SpinnerComponent,
    DynamicTablesComponent,
    DataIngestionTrendsComponent,
    RealtimeNotificationToastComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    CardComponent,
    MaterialModule,
    FormsModule,
  ],
  exports: [
    SpinnerComponent,
    DynamicTablesComponent,
    CardComponent,
    DataIngestionTrendsComponent,
  ],
})
export class ComponentsModule { }
