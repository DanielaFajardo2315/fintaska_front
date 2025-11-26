import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { NotFound } from './pages/not-found/not-found';
import { Profile } from './pages/profile/profile';
import { Finances } from './pages/finances/finances';
import { Register } from './pages/register/register';
import { Login } from './pages/login/login';
import { Admin } from './pages/admin/admin';
import { Board } from './pages/board/board';
import { Planner } from './pages/planner/planner';
import { Tree } from './pages/tree/tree';
import { authGuard } from './guards/auth-guard';
import { userGuard } from './guards/user-guard';

export const routes: Routes = [
    { path: "login", component: Login, title: "Inicio Sesión" },
    { path: '', component: Home, title: 'Inicio', canActivate: [userGuard]},
    { path: 'profile', component: Profile, title: 'Perfil de usuario', canActivate: [userGuard]},
    {path: 'finances', component:Finances, title: 'Finanzas', canActivate: [userGuard]},
    {path: 'register', component:Register, title: 'Registro'},
    {path: 'admin', component:Admin, title: 'Administrador', canActivate: [authGuard]},
    {path:'board', component: Board, title:'Tablero', canActivate: [userGuard]},
    {path: 'planner', component: Planner, title: 'Planeador', canActivate: [userGuard]},
    {path: 'tree', component: Tree, title: 'Arbol', canActivate: [userGuard]},
    { path: '**', component: NotFound, title: '404'}
];
