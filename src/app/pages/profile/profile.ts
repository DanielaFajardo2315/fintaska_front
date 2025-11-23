import { Component, inject, OnInit } from '@angular/core';
import { Button } from '../../components/button/button';
import { Router } from '@angular/router';
import { UserService } from '../../services/user';
import { User } from '../../interfaces/user';
import { LoginService } from '../../services/login';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [Button, DatePipe, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class Profile implements OnInit {
  private _router = inject(Router);
  private _userService = inject(UserService);
  private _loginService = inject(LoginService);

  baseURL: string = environment.appUrl;
  mostrarFormulario = false;
  selectedFile: File | null = null;

  // FormGroup para editar perfil
  editForm = new FormGroup({
    fullName: new FormControl('', [Validators.required]),
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    theme: new FormControl('claro'),
  });

  infoUser: User = {
    _id: '',
    profile: '',
    fullName: '',
    username: '',
    email: '',
    password: '',
    rol: 'usuario',
  };
  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;

    // Cargar datos actuales cuando se abre el formulario
    if (this.mostrarFormulario) {
      this.editForm.patchValue({
        fullName: this.infoUser.fullName,
        username: this.infoUser.username,
        email: this.infoUser.email,
        theme: this.infoUser.settings?.theme || 'claro',
      });
    }
  }

  idUser = this._loginService.infoUser();

  showInfo(idUser: string) {
    this._userService.getUserById(idUser).subscribe({
      next: (resp: any) => {
        this.infoUser = resp.data;
        console.log(this.infoUser);
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
          // Si confirma, llamar a la subida.
          this.updateFiles(this.idUser);
        } else {
          Swal.fire('Imágen de perfil no guardada', '', 'info');
          this.selectedFile = null; // Limpiar si cancela
          event.target.value = null; // Limpiar el input file
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
      // Este error ya no debería ocurrir con la nueva lógica, pero lo mantenemos como seguridad.
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

    const updatedData: User = {
      fullName: this.editForm.value.fullName || '',
      username: this.editForm.value.username || '',
      email: this.editForm.value.email || '',
      rol: 'usuario',
    };

    console.log('Datos a actualizar:', updatedData);

    this._userService.putUser(updatedData, this.idUser).subscribe({
      next: (resp: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Perfil actualizado',
          text: 'Los cambios se guardaron correctamente',
        });

        this.infoUser = { ...this.infoUser, ...updatedData };
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

  ngOnInit(): void {
    this.showInfo(this.idUser);
  }

  goToHome() {
    this._router.navigate(['/']);
  }
}
