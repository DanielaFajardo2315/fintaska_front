import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoginService } from '../services/login';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  
  const _loginService = inject(LoginService);
  const token = _loginService.getToken();
  const request = token ? req.clone({setHeaders:{Authorization: "Bearer " + token}}): req;
 
  return next(request); //pasa la peticion al back
};
