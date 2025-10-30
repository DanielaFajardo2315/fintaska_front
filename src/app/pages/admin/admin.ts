import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../services/user';
import { User } from '../../interfaces/user';

@Component({
  selector: 'app-admin',
  imports: [],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {
  private _userService = inject(UserService);
  
  allUsers: User[] = [];

  showUsers(){
  this._userService.getUser().subscribe({
    next: (response:any)=>{
      this.allUsers = response.data;
      console.log('Estos son los usuarios:', this.allUsers);
    },
    error: (error: any)=>{
      console.error(error.error.mensaje);
    }
  });
  }
  ngOnInit(): void {
    this.showUsers();
  }
}
