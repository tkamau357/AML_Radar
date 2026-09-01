// src/app/authentication/authentication.module.ts
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AuthenticationRoutingModule } from "./authentication-routing.module";
import { Page500Component } from "./page500/page500.component";
import { Page401Component } from './page401/page401.component';

// Remove these imports - they're now in AppModule
// import { Page404Component } from "./page404/page404.component";
// import { SigninComponent } from "./signin/signin.component";
// import { OtpComponent } from './otp/otp.component';
// import { Page403Component } from './page403/page403.component';

import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";

@NgModule({
  declarations: [
    Page500Component,
    Page401Component,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AuthenticationRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
  ],
})
export class AuthenticationModule { }