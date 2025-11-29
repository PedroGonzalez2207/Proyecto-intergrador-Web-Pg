import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { AdminUsuarios } from './pages/admin-usuarios/admin-usuarios';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'admin/usuarios', component: AdminUsuarios },
  { path: '**', redirectTo: 'login' }
];
