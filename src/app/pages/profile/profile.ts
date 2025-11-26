import { Component, inject, OnInit } from '@angular/core';
import { Button } from '../../components/button/button';
import { Router } from '@angular/router';
import { UserService } from '../../services/user';
import { User } from '../../interfaces/user';
import { LoginService } from '../../services/login';
import { DatePipe, CommonModule, NgClass } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { ThemeService } from '../../services/theme-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [Button, DatePipe, ReactiveFormsModule, CommonModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class Profile implements OnInit {
  private _router = inject(Router);
  private _userService = inject(UserService);
  private _loginService = inject(LoginService);
  _themeService = inject(ThemeService);

  baseURL: string = environment.appUrl;
  mostrarFormulario = false;
  formularioContrasena = false;
  selectedFile: File | null = null;
  currentPasswordVisible = false;
  passwordVisible = false;
  confirmPasswordVisible = false;

  // FormGroup para editar perfil
  editForm = new FormGroup({
    fullName: new FormControl('', [Validators.required]),
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    theme: new FormControl(this._themeService.getCurrentTheme(), { nonNullable: true }),
  });

  passwordForm = new FormGroup({
    currentPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required, Validators.minLength(8)]),
    confirmNewPassword: new FormControl('', [Validators.required]),
  });

  infoUser: User = {
    _id: '',
    profile: '',
    fullName: '',
    username: '',
    email: '',
    password: '',
    rol: 'usuario',
    settings: {
      theme: 'claro',
    },
  };

  // Visibilidad de las contraseñas

  toggleCurrentPasswordVisible(): void {
    this.currentPasswordVisible = !this.currentPasswordVisible;
  }

  togglePasswordVisible(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisible(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  // Datos en el formulario de edición
  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;

    // Cargar datos actuales cuando se abre el formulario
    if (this.mostrarFormulario) {
      this.editForm.patchValue({
        fullName: this.infoUser.fullName,
        username: this.infoUser.username,
        email: this.infoUser.email,
        theme: this._themeService.getCurrentTheme(),
      });
    }
  }

  // Formulario de cambio de contraseña
  togglePasswordForm() {
    this.formularioContrasena = !this.formularioContrasena;
    if (!this.formularioContrasena) {
      this.passwordForm.reset();
      this.currentPasswordVisible = false;
      this.passwordVisible = false;
      this.confirmPasswordVisible = false;
    }
  }

  // Método para gestionar el cambio de tema desde el formulario
  private subscribeToThemeChanges(): void {
    this.editForm.get('theme')?.valueChanges.subscribe((themeValue) => {
      if (themeValue === 'claro' || themeValue === 'oscuro') {
        this._themeService.setTheme(themeValue);
      }
    });
  }

  idUser = this._loginService.infoUser();

  showInfo(idUser: string) {
    this._userService.getUserById(idUser).subscribe({
      next: (resp: any) => {
        this.infoUser = resp.data;
        console.log(this.infoUser);
        const dbTheme = this.infoUser.settings?.theme || 'claro';
        if (dbTheme && (dbTheme === 'claro' || dbTheme === 'oscuro')) {
          this._themeService.setTheme(dbTheme);
        }
      },
      error: (err: any) => {
        console.error(err.error.message);
      },
    });
  }

  handleFileChange(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      console.log('Archivo seleccionado:', file.name);

      Swal.fire({
        title: `¿Deseas subir ${file.name} como tu imagen de perfil?`,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        denyButtonText: `Cancelar`,
      }).then((result) => {
        if (result.isConfirmed) {
          this.updateFiles(this.idUser);
        } else {
          Swal.fire('Imágen de perfil no guardada', '', 'info');
          this.selectedFile = null;
          event.target.value = null;
        }
      });
    } else {
      this.selectedFile = null;
    }
  }

  // Subir los archivos en la base de datos
  updateFiles(id: string | undefined) {
    if (!this.selectedFile || !id) {
      console.error('Error de Lógica: El archivo o ID debería estar disponible aquí.');
      if (!id) {
        Swal.fire(
          'Error de Sesión',
          'No se detectó un ID de usuario. Intenta recargar la página.',
          'error'
        );
      }
      return;
    }

    const key = 'profile';
    const value = this.selectedFile;
    const userToEdit = new FormData();
    userToEdit.append(key, value, value.name);
    console.log('Preparando PUT de imagen de perfil...');
    this._userService.putUser(userToEdit, this.idUser).subscribe({
      next: (res: any) => {
        console.log('Respuesta de actualización de archivos', res);
        this.showInfo(this.idUser);

        Swal.fire('Imágen de perfil actualizada', '', 'success');

        this.selectedFile = null;
      },
      error: (err: any) => {
        console.error(err.error.mensaje);
        this.selectedFile = null;
      },
    });
  }

  onSubmit() {
    if (this.editForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario inválido',
        text: 'Por favor completa todos los campos correctamente',
      });
      return;
    }

    const themeValue = this.editForm.value.theme as 'claro' | 'oscuro';

    const updatedData: User = {
      fullName: this.editForm.value.fullName || '',
      username: this.editForm.value.username || '',
      email: this.editForm.value.email || '',
      rol: 'usuario',
      settings: {
        theme: themeValue,
      },
    };

    console.log('Datos a actualizar:', updatedData);

    this._userService.putUser(updatedData, this.idUser).subscribe({
      next: (resp: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Perfil actualizado',
          text: 'Los cambios se guardaron correctamente',
        });

        this.infoUser = {
          ...this.infoUser,
          ...updatedData,
          settings: { ...this.infoUser.settings, theme: themeValue },
        };
        this.toggleFormulario();
      },
      error: (err: any) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error al actualizar',
          text: err.error?.message || 'Intenta nuevamente',
        });
      },
    });
  }

  changePassword() {
    if (this.passwordForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario inválido',
        text: 'Por favor completa todos los campos correctamente',
      });
      return;
    }

    const formValues = this.passwordForm.value;
    const passwordData = {
      currentPassword: formValues.currentPassword || '',
      newPassword: formValues.newPassword || '',
      confirmNewPassword: formValues.confirmNewPassword || '',
    };
    console.log('contraseña del usuario: ', this.infoUser.password);

    // Datos para el servidor
    const dataToSend = {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    };
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      Swal.fire({
        icon: 'error',
        title: 'La nueva contraseña y su confirmación no coinciden',
      });
      return;
    }
    console.log('ID del usuario: ', this.idUser);
    this._userService.changePassword(dataToSend, this.idUser).subscribe({
      next: (resp: any) => {
        console.log('Se cambió la contraseña: ', resp);
        Swal.fire({
          icon: 'success',
          title: 'Contraseña actualizada',
          text: resp.message || 'Tu contraseña ha sido cambiada exitosamente.',
        });
        this.togglePasswordForm();
      },
      error: (err: any) => {
        console.error('Error al cambiar la contraseña: ', err);
        let errorMessage =
          err.error?.message || 'Error desconocido al intentar cambiar la contraseña.';
        if (err.status === 401 || err.status === 400) {
          errorMessage =
            'Contraseña actual incorrecta o la nueva contraseña no cumple con los requisitos.';
        }
        Swal.fire({
          icon: 'error',
          title: 'Error al actualizar',
          text: errorMessage || 'Ocurrió un error desconocido al intentar cambiar la contraseña.',
        });
      },
    });
  }

  ngOnInit(): void {
    this.showInfo(this.idUser);
    this.subscribeToThemeChanges();
  }

  goToHome() {
    this._router.navigate(['/']);
  }
}
