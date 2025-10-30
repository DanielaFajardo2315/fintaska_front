import { CanActivateFn } from '@angular/router';
import { LoginService } from '../services/login';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const _loginService = inject(LoginService);
  const _router = inject(Router);

  if(!_loginService.isLoggedIn()){
    alert('No has iniciado sesión');
    _router.navigate(['/login']);
    return false;
  }

  if(!_loginService.isAdmin()){
    alert('No tienes permitido acceder a esta página, serás redireccionado al inicio')
    _router.navigate(['/']);
    return false;
  }

  return true;
};
