import { Routes } from '@angular/router';

import { Finances } from './pages/finances/finances';
import { Register } from './pages/register/register';
import { Admin } from './pages/admin/admin';


export const routes: Routes = [
    {path: 'finances', component:Finances, title: 'Finanzas'},
    {path: 'register', component:Register, title: 'Registro'},
    {path: 'admin', component:Admin, title: 'Administrador'}
];
