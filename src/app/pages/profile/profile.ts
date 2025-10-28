import { Component } from '@angular/core';
import { Button } from '../../components/button/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [Button],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
constructor(private router: Router) {}

  goToHome() {
    this.router.navigate(['/']);
  }
}
