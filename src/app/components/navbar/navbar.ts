import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { LoginService } from '../../services/login';

@Component({
  selector: 'app-navbar',
  standalone: true, //agregado por estructura moderna Standalone Components -> marcar componentes y luego impotarlos
  imports: [RouterLink, NgClass],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  @Input() theme: string = 'theme-default';

  private _loginService = inject(LoginService);

  isMenuCollapsed = true;
  isAdmin: boolean = false;
  isLoggedIn: boolean = false;

  ngOnInit() {
    // Evaluar el estado al inicializar el componente
    this.updateAuthState();
  }

  updateAuthState() {
    this.isLoggedIn = this._loginService.isLoggedIn();
    this.isAdmin = this._loginService.isAdmin();
  }

  toggleMenu() {
    this.isMenuCollapsed = !this.isMenuCollapsed;
  }

  onNotificationsClick() {
    console.log('Clic en notificaciones');
    // Aquí puedes abrir un modal, redirigir, etc.
  }

  logout() {
    console.log('Clic en salir');
    this._loginService.logout();
  }
}
