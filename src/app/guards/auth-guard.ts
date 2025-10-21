import { CanActivateFn } from '@angular/router';
import { LoginService } from '../services/login';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const _loginService = inject(LoginService);
  const _router = inject(Router);

  // VALIDADION 1: INICIO SESION
  if(!_loginService.isLoggedIn()){
    //redireccione a inicio de sesion y retorne false (NO MOSTRAR CONTENIDO)
    alert('No has iniciado sesion')
    _router.navigate(['/login']);
    return false;
  }


  // VALIDACION 2: ES ADMIN O NO
  if(!_loginService.isAdmin()){
    alert('No tienes permitido acceder a esta página, seras redireccionado al inicio');
    _router.navigate(['/']); // redireccionado a home
    return false;
  }

  return true;
};
