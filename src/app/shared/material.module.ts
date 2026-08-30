import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// angular material imports
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule, MatNavList } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatTreeModule } from '@angular/material/tree';
import { NgxMaskModule } from 'ngx-mask'; //import
import { MatButtonToggleModule } from "@angular/material/button-toggle";

const materialModules = [
  MatButtonModule,
  MatInputModule,
  MatListModule,
  MatIconModule,
  MatTooltipModule,
  MatDatepickerModule,
  MatNativeDateModule,
  NgxMaskModule.forRoot(),
  MatButtonToggleModule,
  MatFormFieldModule,
  MatSlideToggleModule,
  CommonModule,
  MatDialogModule,
  MatBadgeModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatToolbarModule,
  MatInputModule,
  MatCardModule,
  MatSidenavModule,
  MatMenuModule,
  MatSelectModule,
  MatOptionModule,
  MatExpansionModule,
  MatDividerModule,
  MatRadioModule,
  MatAutocompleteModule,
  MatProgressSpinnerModule,
  ScrollingModule,
  MatTreeModule,
  MatCheckboxModule
];
@NgModule({
  declarations: [],
  imports: [materialModules],
  exports: [materialModules],
})
export class MaterialModule { }
