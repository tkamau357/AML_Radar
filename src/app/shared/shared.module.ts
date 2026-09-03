import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// ───── Material modules (you already have a MaterialModule – keep it) ─────
import { MaterialModule } from './material.module';

// ───── Feather icons (your own wrapper) ─────
import { FeatherIconsModule } from './components/feather-icons/feather-icons.module';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';

// ───── Individual Material modules you need in templates ─────
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatSortModule } from '@angular/material/sort';

// ───── Your directives ─────
import { HasPermissionDirective } from '../directivies/has-permission-directive/has-permission.directive';
import { AmountPipe } from './pipes/amount.pipe';

@NgModule({
  declarations: [
    AmountPipe,
    HasPermissionDirective,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgbModule,

    // ---- YOUR OWN MODULES -------------------------------------------------
    MaterialModule,          // <-- contains the big list of Material modules
    FeatherIconsModule,      // <-- <app-feather-icons> lives here

    // ---- INDIVIDUAL MATERIAL MODULES (so they are available when SharedModule is imported) ----
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatTabsModule,
    MatTooltipModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    MatSnackBarModule,
    MatDialogModule,
    MatMenuModule,
    MatRadioModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatChipsModule,
    MatSortModule,
    MatInputModule,
    MatAutocompleteModule,
    MatStepperModule,
    MatProgressBarModule,
    MatDividerModule,
  ],
  exports: [
    // ------ Custom Pipes--------------------------------------------------
    AmountPipe,
    // ---- Angular core ----------------------------------------------------
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgbModule,

    // ---- YOUR OWN MODULES ------------------------------------------------
    MaterialModule,
    FeatherIconsModule,

    // ---- DIRECTIVES ------------------------------------------------------
    HasPermissionDirective,
    // ---- MATERIAL (re-exported for convenience) -------------------------
    MatIconModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatTabsModule,
    MatTooltipModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    MatSnackBarModule,
    MatDialogModule,
    MatMenuModule,
    MatRadioModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatChipsModule,
    MatSortModule,
    MatInputModule,
    MatAutocompleteModule,
    MatStepperModule,
    MatProgressBarModule,
    MatDividerModule,
  ],
})
export class SharedModule {}