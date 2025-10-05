import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { NotFound } from './pages/not-found/not-found';
import { Profile } from './pages/profile/profile';
import { Finances } from './pages/finances/finances';
import { Register } from './pages/register/register';
import { Admin } from './pages/admin/admin';

export const routes: Routes = [
    { path: '', component: Home, title: 'Inicio'},
    { path: 'profile', component: Profile, title: 'Perfil de usuario'},
    {path: 'finances', component:Finances, title: 'Finanzas'},
    {path: 'register', component:Register, title: 'Registro'},
    {path: 'admin', component:Admin, title: 'Administrador'},
    { path: '**', component: NotFound, title: '404'}
];
