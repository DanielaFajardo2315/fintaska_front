import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  showMoreInfo = signal(false);

  toggleMoreInfo() {
    console.log('Botón clickeado');
    this.showMoreInfo.set(!this.showMoreInfo());
  }
}