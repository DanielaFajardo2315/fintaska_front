import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Board } from '../pages/board/board';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  
  private _httpClient = inject(HttpClient);
  private apiUrl = "http://localhost:3000";

//Peticion POST
postBoard(boardToCreate: Board ){
return this._httpClient.post(this.apiUrl + "/board", boardToCreate)
};


//Peticion Get
getBoards(){
return this._httpClient.get(this.apiUrl + "/board");
};

//Peticion Get Tag

getBoardsByTag(tag: string) {
  return this._httpClient.get(`${this.apiUrl}/boards/${tag}`);
}

 
//Peticion Put
putBoard(boardToUpdate : Board, id:string){
return this._httpClient.put(`${this.apiUrl}/boards${id}`, boardToUpdate);

};


//Petición Delete
  deleteBoard(id: string){
return this._httpClient.delete(this.apiUrl + "/boards" + id)
  };

}
