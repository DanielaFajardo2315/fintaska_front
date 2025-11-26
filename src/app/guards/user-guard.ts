import { CanActivateFn } from '@angular/router';
import { LoginService } from '../services/login';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const userGuard: CanActivateFn = (route, state) => {
  const _loginService = inject(LoginService);
  const _router = inject(Router);

  if(!_loginService.isLoggedIn()){
    _router.navigate(['/login']);
    return false;
  }
  return true;
};
