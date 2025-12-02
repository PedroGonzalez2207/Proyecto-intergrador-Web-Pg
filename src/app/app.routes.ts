import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { AdminUsuarios } from './pages/admin-usuarios/admin-usuarios';
import { AdminAsesorias } from './pages/admin-asesorias/admin-asesorias';
import { ProgramadorPortafolio } from './pages/programador-portafolio/programador-portafolio';
import { ProgramadorAsesorias } from './pages/programador-asesorias/programador-asesorias';
import { Usuario } from './pages/usuario/usuario';
import { UsuarioDetallesPortafolios } from './pages/usuario-detalles-portafolios/usuario-detalles-portafolios';
import { UsuarioAgendar } from './pages/usuario-agendar/usuario-agendar';


export const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},

  {path: 'login', component: Login},

  {path: 'admin/usuarios', component: AdminUsuarios},
  {path: 'admin/asesorias', component: AdminAsesorias},
  {path: 'programador/portafolio', component: ProgramadorPortafolio},
  {path: 'programador/asesorias', component: ProgramadorAsesorias},
  {path: 'usuario', component: Usuario},
  {path: 'usuario/detalles-portafolio', component: UsuarioDetallesPortafolios},
  {path: 'usuario/agendar-asesoria', component: UsuarioAgendar},
  {path: '**', redirectTo: 'login'}  
];
