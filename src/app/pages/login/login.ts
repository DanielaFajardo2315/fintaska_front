import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { ReactiveFormsModule, FormBuilder, FormControl, FormGroup, Validators, } from '@angular/forms';
import { Credentials } from '../../interfaces/credentials';
import { LoginService } from '../../services/login';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})

export class Login {
  private _loginService = inject(LoginService);

  loginForm = new FormGroup({
    emailLogin: new FormControl('', [Validators.required, Validators.email]),
    passwordLogin: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });

  handleSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const loginCredentials: Credentials = {
      emailLogin: this.loginForm.value.emailLogin || '',
      passwordLogin: this.loginForm.value.passwordLogin || '',
    };
    console.log('Credenciales para login: ', loginCredentials);

    this._loginService.login(loginCredentials).subscribe({
      next: (res: any) => {
        if (res) {
          localStorage.setItem('token', res.token);
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: res.mensaje,
            showConfirmButton: false,
            timer: 1500,
          });
          this._loginService.redirectTo();
        }
      },
      error: (err: any) => {
        console.error(err.error.mensaje);
        Swal.fire({
          title: 'Oops!',
          text: err.error.mensaje,
          icon: 'error',
        });
      }
    });
  }

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
