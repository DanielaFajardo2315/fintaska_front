import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Notifications } from '../interfaces/notifications';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  public _httpClient = inject(HttpClient);

  public apiUrl = environment.appUrl;

  //petición GET
  getAllNotifications(){
    return this._httpClient.get(this.apiUrl + '/notifications');
  }
  getUnreadNotification(){
    return this._httpClient.get(this.apiUrl + '/notifications/unread');
  }
  pendingNotifications(){
    return this._httpClient.get(this.apiUrl + '/notifications/pending');
  }
  //petición PATCH
  markAsRead( id: string | undefined ){
    return this._httpClient.patch(`${this.apiUrl}/notifications/${id}/read`, null);
  }
}
