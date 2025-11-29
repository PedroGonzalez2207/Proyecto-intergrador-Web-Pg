import { Component , OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AppUser, Role } from '../../models/app-user';
import { User } from '../../services/user';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-usuarios.html',
  styleUrls: ['./admin-usuarios.scss'],
})
export class AdminUsuarios implements OnInit {

  users$!: Observable<AppUser[]>;

  constructor(private userService: User) {}
  
  ngOnInit(): void {
    this.users$ = this.userService.getAllUsers();
  }

  //Cambiar rol usuario
  cambiarRol(user: AppUser, rol: Role){
    this.userService.updateRol(user.uid, rol);
  }

}
