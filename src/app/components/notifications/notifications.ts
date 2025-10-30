import { Component, inject, OnInit } from '@angular/core';
import { Notifications } from '../../interfaces/notifications';
import { NotificationsService } from '../../services/notifications';

@Component({
  selector: 'app-notifications',
  imports: [],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class NotificationsComponent implements OnInit {
  private _notificationsService = inject(NotificationsService);
  notifications: Notifications[] = [];
  message: string = '';
  isLoading: boolean = false;

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

  readNotification(id: string | undefined, notification: Notifications) {
    console.log(notification);
    this._notificationsService.markAsRead(id).subscribe({
      next: (resp: any) => {
        console.log(resp);
        // this.readStyle = true;
        // notification.readStyle = true;
      },
      error: (err: any) => {
        console.error(err);
        // this.readStyle = false;
      },
    });
  }

  ngOnInit(): void {
    this.getUnredNotifications();
  }
}

