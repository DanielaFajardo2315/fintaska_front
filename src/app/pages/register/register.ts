import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService } from '../../services/user';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private _userService = inject(UserService);
  private _router = inject(Router);

  registerForm = new FormGroup({
    fullName: new FormControl('', [Validators.required, Validators.minLength(3)]),
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    emailRegister: new FormControl('', [Validators.required, Validators.email]),
    passwordRegister: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl('', [Validators.required]),
    rol: new FormControl<'usuario' | 'admin'>('usuario'),
  });

  passwordVisible = false;
  confirmPasswordVisible = false;

  togglePasswordVisible(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisible(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  handleSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    if (this.registerForm.value.passwordRegister !== this.registerForm.value.confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Las contraseñas no coinciden',
        text: 'Por favor verifica, inténtalo nuevamente',
      });
      return;
    }

    const userToRegister: User = {
      _id: '',
      fullName: this.registerForm.value.fullName  || '',
      username: this.registerForm.value.username || '',
      email: this.registerForm.value.emailRegister || '',
      password: this.registerForm.value.passwordRegister || '',
      rol: 'usuario',
    };

    this._userService.postUser(userToRegister).subscribe({
      next: (res: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Registro Exitoso',
          text: res.mensaje,
        });

        if (res.token) {
          localStorage.setItem('token', res.token);
        }

        this._router.navigate(['/login']);
      },
      error: (err: any) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Ocurrió un error al registrarse',
          text: err.error.mensaje,
        });
      }
    });
  }
}