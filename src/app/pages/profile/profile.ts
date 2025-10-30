import { Component, inject, OnInit } from '@angular/core';
import { Button } from '../../components/button/button';
import { Router } from '@angular/router';
import { UserService } from '../../services/user';
import { User } from '../../interfaces/user';
import { LoginService } from '../../services/login';
import { DatePipe } from '@angular/common';
import {ReactiveFormsModule, FormGroup, FormControl, Validators} from "@angular/forms";
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
  private _loginService = inject(LoginService)


  mostrarFormulario = false;
   selectedFile: File | null = null;

   // FormGroup para editar perfil
  editForm = new FormGroup({
    fullName: new FormControl('', [Validators.required]),
    username: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    theme: new FormControl('claro')
    });

  toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
  
        // Cargar datos actuales cuando se abre el formulario
    if (this.mostrarFormulario) {
      this.editForm.patchValue({
        fullName: this.infoUser.fullName,
        username: this.infoUser.username,
        email: this.infoUser.email,
        theme: this.infoUser.settings?.theme || 'claro'
      });
    }
  }

  

  infoUser: User = {
    settings: {
      theme: "light",
      notifications: true
    },
    planner: {
      notifications: [],
      tasks: [],
      board: [],
      finances: []
    },
    _id: "",
    fullName: "",
    username: "",
    email: "",
    password: "",
    rol: "usuario",
    registerDate: new Date(),
  };



  idUser = this._loginService.infoUser();

  showInfo(idUser: string) {
    this._userService.getUserById(idUser).subscribe({
      next: (resp: any) => {
        this.infoUser = resp.data;
        console.log(this.infoUser);

      },
      error: (err: any) => {
        console.error(err.error.message);
      }
    });
  }

   onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      console.log('Archivo seleccionado:', file.name);
    }
  }

  onSubmit() {
    if (this.editForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario inválido',
        text: 'Por favor completa todos los campos correctamente'
      });
      return;
    }

     const updatedData = {
      fullName: this.editForm.value.fullName!,
      username: this.editForm.value.username!,
      email: this.editForm.value.email!,
      settings: {
        theme: this.editForm.value.theme!,
        notifications: this.infoUser.settings?.notifications || true
      }
    };

    console.log('Datos a actualizar:', updatedData);

     this._userService.updateUser(this.idUser, updatedData).subscribe({
      next: (resp: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Perfil actualizado',
          text: 'Los cambios se guardaron correctamente'
        });

         this.infoUser = { ...this.infoUser, ...updatedData };
        this.toggleFormulario();
      },
      error: (err: any) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error al actualizar',
          text: err.error?.message || 'Intenta nuevamente'
        });
      }
    });
  }
  
  ngOnInit(): void {
    this.showInfo(this.idUser)

  }

  goToHome() {
    this._router.navigate(['/']);
  }

}

