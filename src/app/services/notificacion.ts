import { Injectable } from '@angular/core';
import { AppNotification } from '../models/notificacion';
import { Observable } from 'rxjs';
// importa aquí tu cliente HTTP o Firestore

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  createNotification(notif: AppNotification): Promise<void> | Observable<any> {
    // Envíar la notificación a tu backend / Firestore.
    throw new Error('Implementa createNotification según tu backend');
  }

  getNotificationsForUser(userId: string): Observable<AppNotification[]> {
    throw new Error('Implementa getNotificationsForUser según tu backend');
  }

  markAsRead(notificationId: string): Promise<void> | Observable<any> {
    //Marcar como leída.
    throw new Error('Implementa markAsRead según tu backend');
  }
}
