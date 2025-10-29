import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { LoginService } from '../../services/login';
import { NotificationsComponent } from '../notifications/notifications';
import { Router } from '@angular/router';
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
  showNotifications: boolean = false;

  isMenuCollapsed = true;

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
}
