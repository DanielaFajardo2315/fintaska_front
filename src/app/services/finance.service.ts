import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Finance } from '../interfaces/finance.interface';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  //1. Inyectar: metodos, proveedores, ... dependencias o directivas de Angular. 
  private _httpClient = inject(HttpClient); //variable = inject(dependencia)
  
  //2. Definir la ruta de acceso al back
  private apiUrl = environment.appUrl; //de la variable de entorno llamamos la url de la app

  //3. Métodos para hacer las peticiones

  //peticion POST - crear movimiento
  postFinance(financeToCreate: Finance){
    return this._httpClient.post(`${this.apiUrl}/finances`,financeToCreate);
  }

  //peticion GET - obtener todos los movimientos
  getFinances(){
    return this._httpClient.get(`${this.apiUrl}/finances`);
  }

  //peticion PUT
  putFinance(financeToUpdate :Finance, idFinanceUpdate: string){
    return this._httpClient.put(`${this.apiUrl}/finances/${idFinanceUpdate}`,financeToUpdate)
  }

    

  //peticion DELETE
  deleteFinance(idFinanceDelete:string){
    return this._httpClient.delete(`${this.apiUrl}/finances/${idFinanceDelete}`)
  }
  //Obtener Resumen financiero - GET
  getFinancialSummary(): Observable<any> {
    return this._httpClient.get(`${this.apiUrl}/finances/summary`);
  }
  
}
