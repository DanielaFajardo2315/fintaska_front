import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { NotFound } from './pages/not-found/not-found';
import { Profile } from './pages/profile/profile';

export const routes: Routes = [
    { path: '', component: Home, title: 'Inicio'},
    { path: 'profile', component: Profile, title: 'Perfil de usuario'},
    { path: '**', component: NotFound, title: '404'}
];