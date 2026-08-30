import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page401',
  standalone: false,
  templateUrl: './page401.component.html',
  styleUrl: './page401.component.sass',
})
export class Page401Component {
 constructor(private router: Router) {}

  goToLogin(): void {
    this.router.navigate(['/authentication/signin']);
  }
}
