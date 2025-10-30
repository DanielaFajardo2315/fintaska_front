import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { MoreButton } from './components/more-button/more-button';
import { Button } from './components/button/button';
// import { Login } from './pages/login/login';
// import { Register } from './pages/register/register';}
import { Notifications } from './components/notifications/notifications';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, CommonModule, Notifications],
  templateUrl: './app.html',
  styleUrl: './app.css'  
})
export class App {
  protected readonly title = signal('fintaska_front');

  hideNavbar = signal(false);
  currentNavbarTheme = signal('theme-default');

  // Signal para controlar la visibilidad de notificaciones
  showNotifications = signal(false);
  
  private router = inject(Router);

  constructor() {
    // Verificar ruta inicial
    this.handleRouteChange(this.router.url);

    // Escuchar cambios de ruta
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.handleRouteChange(event.urlAfterRedirects);
      });
  }

  private handleRouteChange(url: string) {
    // Ocultar navbar en login, register y not-found 
    const hiddenRoutes = ['/login', '/register'];
    this.hideNavbar.set(hiddenRoutes.includes(url));

    // Cambiar tema según la ruta
    if (url.startsWith('/finances')) {
      this.currentNavbarTheme.set('theme-finances');
    } else if (url.startsWith('/board')) {
      this.currentNavbarTheme.set('theme-board');
    } else if (url.startsWith('/planner')) {
      this.currentNavbarTheme.set('theme-planner');
    } else {
      this.currentNavbarTheme.set('theme-default');
    }
  //-------------------------------------------------------
    // Cerrar notificaciones al cambiar de ruta
    this.showNotifications.set(false);
  }

  // Método que recibe el evento del navbar
  toggleNotifications(): void {
    this.showNotifications.update(value => !value);
    console.log('Notificaciones visibles:', this.showNotifications());
  }

  // Método para cerrar notificaciones
  closeNotifications(): void {
    this.showNotifications.set(false);
  }
}
