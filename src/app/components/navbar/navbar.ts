import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true, //agregado por estructura moderna Standalone Components -> marcar componentes y luego impotarlos
  imports: [RouterLink, NgClass],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
    @Input() theme: string = 'theme-default';

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
    // agregar servicio autenticacion
    // this.authService.logout();
  }

}
