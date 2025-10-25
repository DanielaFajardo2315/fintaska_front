import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { LoginService } from '../../services/login';
import { NotificationsComponent } from '../notifications/notifications';

@Component({
  selector: 'app-navbar',
  standalone: true, //agregado por estructura moderna Standalone Components -> marcar componentes y luego impotarlos
  imports: [RouterLink, NgClass, NotificationsComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
    @Input() theme: string = 'theme-default';
    private _loginService = inject(LoginService);
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
    console.log('Clic en salir');
    // agregar servicio autenticacion
    // this.authService.logout();
  }

  isVisible: boolean = this._loginService.isAdmin();
}
