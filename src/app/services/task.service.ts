import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Task } from '../interfaces/task.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  //1. Inyectar: metodos, proveedores, ... dependencias o directivas de Angular.
  private _httpClient = inject(HttpClient); //variable = inject(dependencia)

  //2. Definir la ruta de acceso al back
  private apiUrl = environment.appUrl; //de la variable de entorno llamamos la url de la app

  //3. Métodos para hacer las peticiones

  //peticion POST - crear tarea
  postTask(taskToCreate: Task) {
    return this._httpClient.post(`${this.apiUrl}/tasks`, taskToCreate);
  }

  //peticion GET - obtener todas las tareas
  getTasks() {
    return this._httpClient.get(`${this.apiUrl}/tasks`);
  }
  
  // petición GET - obtener tareas por usuario
  getAllUserTasks(userId: string) {
    return this._httpClient.get(`${this.apiUrl}/tasks/${userId}`);
  }

  //peticion PUT - actualizar tarea
  putTask(taskToUpdate: Task, idTaskUpdate: string) {
    return this._httpClient.put(`${this.apiUrl}/tasks/${idTaskUpdate}`, taskToUpdate);
  }

  //peticion DELETE
  deleteTask(idTaskDelete: string) {
    return this._httpClient.delete(`${this.apiUrl}/tasks/${idTaskDelete}`);
  }
}
