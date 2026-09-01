import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { SigninComponent } from "./signin/signin.component";
import { OtpComponent } from "./otp/otp.component";
import { ChangePasswordComponent } from "./change-password/change-password.component";
import { Page404Component } from "./page404/page404.component";
import { Page403Component } from "./page403/page403.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "sign-in",
    pathMatch: "full",
  },
  {
    path: "sign-in",
    component: SigninComponent,
  },
  {
    path: "verify-otp",
    component: OtpComponent,
  },
  {
    path: "change-password",
    component: ChangePasswordComponent,
  },
  {
    path: "unauthorized",
    component: Page403Component,
  },
  {
    path: "**",
    component: Page404Component,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthenticationRoutingModule {}