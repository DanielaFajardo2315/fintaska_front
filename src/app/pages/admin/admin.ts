import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../services/user';
import { User } from '../../interfaces/user';
import { environment } from '../../../environments/environment';
import { filter } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin',
  imports: [],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  private _userService = inject(UserService);

  baseURL: string = environment.appUrl;
  allUsers: User[] = [];
  users: User[] = [];
  admins: User[] = [];
  mostrarModal = false;
  selectedUser: User | null = null;

  showUsers() {
    this._userService.getUser().subscribe({
      next: (response: any) => {
        this.allUsers = response.data;
        this.users = this.allUsers.filter((user) => user.rol !== 'admin');
        this.admins = this.allUsers.filter((user) => user.rol === 'admin');
        console.log('Estos son los usuarios:', this.allUsers);
      },
      error: (error: any) => {
        console.error(error.error.mensaje);
      },
    });
  }

  toggleModal(user: User | null = null) {
    if (!this.mostrarModal) {
      this.selectedUser = user;
    } else {
      this.selectedUser = null;
    }
    this.mostrarModal = !this.mostrarModal;
  }

  deleteUser(user: User | null = null) {
    if (!user?._id) {
      console.error('ID de usuario no proporcionado');
      return;
    }
    this.selectedUser = user;
    Swal.fire({
      title: `¿Deseas eliminar al usuario "${this.selectedUser?.fullName}"?`,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonAriaLabel: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this._userService.deleteUser(user._id).subscribe({
          next: (response: any) => {
            console.log(response.message);
            this.showUsers();
            Swal.fire(response.message, '', 'success');
          },
          error: (error: any) => {
            console.error(error.error.message);
            Swal.fire('Error', error.error.message, 'error');
          },
        });
      }
    });
  }

  ngOnInit(): void {
    this.showUsers();
  }
}
