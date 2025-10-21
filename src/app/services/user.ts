import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../interfaces/user';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private _httpClient = inject(HttpClient);
  private apiUrl = environment.appUrl;

  //Petición Post
  postUser(userToCreate: User) {
    return this._httpClient.post(`${this.apiUrl}/users`, userToCreate);
  }

  //Petición Get
  getUser() {
    return this._httpClient.get(`${this.apiUrl}/users`);
  }

  //Peticion Get Id
  getUserById(id: string) {
    return this._httpClient.get(`${this.apiUrl}/users${id}`);
  }

  //Peticion Put
  putUser(userToUpdate: User, id: string) {
    return this._httpClient.put(`${this.apiUrl}/users${id}`, userToUpdate);
  }

  //Peticion Delete
  deleteUser(id: string) {
    return this._httpClient.delete(`${this.apiUrl}/users${id}`);
  }
}
