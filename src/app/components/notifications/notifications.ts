import { Component, inject, OnInit } from '@angular/core';
import { Notifications } from '../../interfaces/notifications';
import { NotificationsService } from '../../services/notifications';
import { ClickOutside } from "../../click-outside";

@Component({
  selector: 'app-notifications',
  imports: [ClickOutside],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class NotificationsComponent implements OnInit {
  private _notificationsService = inject(NotificationsService);
  notifications: Notifications[] = [];
  message: string = '';
  isLoading: boolean = false;

  // cierre del componente si hay click en otro lado
  isDialogOpen : boolean = true;

  closeDialog(): void {
    console.log('Se cerró el dialogó por CLICK fuera');
    this.isDialogOpen = false;
  }

  // Obtener las notificaciones no leidas
  getUnredNotifications() {
    this.isLoading = true;
    this._notificationsService.getUnreadNotification().subscribe({
      next: (resp: any) => {
        console.log(resp);
        if (resp.data) {
          this.notifications = resp.data;
          this.notifications = this.notifications.map(n => ({
            ...n, readStyle: false
          }))
        }
        this.message = resp.message;
        this.isLoading = false;
        console.log(this.message);
      },
      error: (err: any) => {
        console.error(err);
        this.message = err.error.message;
        this.isLoading = false;
      },
    });
  }

  // Marcar una notificación como leida
  readNotification(id: string | undefined, notification: Notifications) {
    console.log(notification);
    this._notificationsService.markAsRead(id).subscribe({
      next: (resp: any) => {
        console.log(resp);
      },
      error: (err: any) => {
        console.error(err);
      },
    });
  }

  ngOnInit(): void {
    this.getUnredNotifications();
  }
}

