import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { LoginService } from '../../services/login';

@Component({
  selector: 'app-navbar',
  standalone: true, //agregado por estructura moderna Standalone Components -> marcar componentes y luego impotarlos
  imports: [RouterLink, NgClass],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
    @Input() theme: string = 'theme-default';
<<<<<<< HEAD
    private _loginService = inject(LoginService);

=======
    
    private _loginService = inject(LoginService);
    
>>>>>>> origin/rama_laura
    isMenuCollapsed = true;
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

  isVisible: boolean = this._loginService.isAdmin();
}
