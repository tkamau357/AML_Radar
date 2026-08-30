import { Component, OnInit } from "@angular/core";
import { Location } from "@angular/common";
import { Router } from "@angular/router";
@Component({
    selector: "app-page404",
    templateUrl: "./page404.component.html",
    styleUrls: ["./page404.component.scss"],
    standalone: false
})
export class Page404Component implements OnInit {
  constructor(
    private location: Location,
    private router: Router
  ) {}
  ngOnInit() {}
   goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']); 
    }
  }
}
