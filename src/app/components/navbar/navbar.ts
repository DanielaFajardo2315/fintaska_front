import { Component, Input, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { LoginService } from '../../services/login';
import { User } from '../../interfaces/user';
import { UserService } from '../../services/user';
import { NotificationsComponent } from '../notifications/notifications';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  standalone: true, //agregado por estructura moderna Standalone Components -> marcar componentes y luego impotarlos
  imports: [RouterLink, NgClass, NotificationsComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  @Input() theme: string = 'theme-default';
  private _loginService = inject(LoginService);
  private _router = inject(Router);
  private _userService = inject(UserService);
  showNotifications: boolean = false;

  baseURL: string = environment.appUrl;
  isMenuCollapsed = true;

  infoUser: User = {
    _id: '',
    profile: '',
    fullName: '',
    username: '',
    email: '',
    password: '',
    rol: 'usuario',
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
      },
    });
  }

  toggleMenu() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  onNotificationsClick() {
    console.log('Clic en notificaciones');
    this.showNotifications = !this.showNotifications;
  }

  logout() {
    localStorage.removeItem('token');
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'Cierre de sesión exitoso, vuelve pronto',
      showConfirmButton: false,
      timer: 1500,
    });

    this._router.navigate(['/login']);
  }

  isVisible: boolean = this._loginService.isAdmin();

  ngOnInit(): void {
    this.showInfo(this.idUser);
  }
}
