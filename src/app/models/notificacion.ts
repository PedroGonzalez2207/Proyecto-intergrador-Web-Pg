export interface AppNotification {
  id?: string;
  userId: string;
  roleTarget: 'Programador' | 'Usuario';
  type: 'NEW_REQUEST' | 'REQUEST_APPROVED' | 'REQUEST_REJECTED';
  message: string;
  createdAt: Date;
  read: boolean;
  relatedAppointmentId?: string;
}
