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
return this._httpClient.post(this.apiUrl + "/board/crear", boardToCreate)
};


//Peticion Get
getBoards(){
return this._httpClient.get(this.apiUrl + "/board/mostrar");
};



//Peticion Put
putProduct(boardToUpdate : Board, id:string){
return this._httpClient.put(`${this.apiUrl}/boards/actualizar/${id}`, boardToUpdate);

};


//Petición Delete
  deleteBoard(id: string){
return this._httpClient.delete(this.apiUrl + "/boards/eliminar/" + id)
  };

}
