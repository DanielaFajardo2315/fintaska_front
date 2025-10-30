import { Component, inject, OnInit } from '@angular/core';
import { Button } from '../../components/button/button';
import { Router } from '@angular/router';
import { UserService } from '../../services/user';
import { User } from '../../interfaces/user';
import { LoginService } from '../../services/login';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-profile',
  imports: [Button, CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  private _router = inject(Router);
  private _userService = inject(UserService);
  private _loginService = inject(LoginService)


  mostrarFormulario = false;

   toggleFormulario() {
    this.mostrarFormulario = !this.mostrarFormulario;
  }


  infoUser : User= {
    settings: {
      theme: "light",
      notifications: true
    },
    planner: {
      notifications: [],
      tasks: [],
      board: [],
      finances: []
    },
    _id: "",
    fullName: "",
    username: "",
    email: "",
    password: "",
    rol: "usuario",
    registerDate: new Date(),
  };



idUser = this._loginService.infoUser();

showInfo(idUser: string) {
  this._userService.getUserById(idUser).subscribe({
    next: (resp: any) => {
      this.infoUser = resp.data;
      console.log(this.infoUser);

    },
    error: (err: any) => {
      console.error(err.error.message);
    }

  })
}


ngOnInit(): void { this.showInfo(this.idUser) }

goToHome() {
  this._router.navigate(['/']);
}

}

