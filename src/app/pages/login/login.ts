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

/* Mostrar Contraseña*/
  ngAfterViewInit(): void {
    const togglePassword = document.getElementById('togglePassword');
    const password = document.getElementById('password') as HTMLInputElement;

    if (togglePassword && password) {
      togglePassword.addEventListener('click', function () {
        const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
        password.setAttribute('type', type);

        this.classList.toggle('bi-eye');
        this.classList.toggle('bi-eye-slash');
      });
    }
  }
}
