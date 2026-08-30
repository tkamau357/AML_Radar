import { Component, OnInit } from '@angular/core';
import { Location } from "@angular/common";
import { Router } from '@angular/router';

@Component({
  selector: 'app-page403',
  standalone: false,
  templateUrl: './page403.component.html',
  styleUrl: './page403.component.sass',
})
export class Page403Component implements OnInit {
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
