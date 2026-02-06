import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { AdminUsuarios } from './pages/admin-usuarios/admin-usuarios';
import { AdminAsesorias } from './pages/admin-asesorias/admin-asesorias';
import { ProgramadorPortafolio } from './pages/programador-portafolio/programador-portafolio';
import { ProgramadorAsesorias } from './pages/programador-asesorias/programador-asesorias';
import { DashboardProgramadorComponent } from './pages/programador/dashboard-programador/dashboard-programador';
import { Usuario } from './pages/usuario/usuario';
import { TestBackendComponent } from './pages/test-backend/test-backend';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'login', redirectTo: '', pathMatch: 'full' },

  { path: 'admin/usuarios', component: AdminUsuarios },
  { path: 'admin/asesorias', component: AdminAsesorias },

  { path: 'programador/dashboard', component: DashboardProgramadorComponent },
  { path: 'programador/portafolio', component: ProgramadorPortafolio },
  { path: 'programador/asesorias', component: ProgramadorAsesorias },

  { path: 'usuario', component: Usuario },
  { path: 'test-backend', component: TestBackendComponent },

  { path: '**', redirectTo: '' },
];
