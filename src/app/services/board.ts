import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Board } from '../interfaces/board';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  private _httpClient = inject(HttpClient);
  private apiUrl = environment.appUrl;

  //Peticion POST
  postBoard(boardToCreate: Board) {
    return this._httpClient.post(this.apiUrl + '/boards', boardToCreate);
  }

  //Peticion Get
  getBoards() {
    return this._httpClient.get(this.apiUrl + '/boards');
  }

  //Peticion Get Tag

  getBoardsByTag(tag: string) {
    return this._httpClient.get(`${this.apiUrl}/boards/${tag}`);
  }

  //Peticion Put
  putBoard(boardToUpdate: Board, id: string) {
    return this._httpClient.put(`${this.apiUrl}/boards/${id}`, boardToUpdate);
  }

  //Petición Delete
  deleteBoard(id: string) {
    return this._httpClient.delete(`${this.apiUrl}/boards/${id}`);
  }
}
