import { Routes } from '@angular/router';


import { Board } from './pages/board/board';
import { Planner } from './pages/planner/planner';
import { Tree } from './pages/tree/tree';


export const routes: Routes = [
    {path:'board', component: Board, title:'Tablero'},
    {path: 'planner', component: Planner, title: 'Planeador'},
    {path: 'tree', component: Tree, title: 'Arbol'},
];
