import { Component } from '@angular/core';
import { Button } from '../../components/button/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [Button],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css'
})
export class NotFound {
constructor(private router: Router) {}

  goToHome() {
    this.router.navigate(['/']);
  }
}

