export const NOTIFICATIONS_STATUS_PATTERN = 'notifications.status';

export interface NotificationsStatusRequest {
  customer: string;
}

export interface NotificationsStatusResponse {
  customer: string;
  sent: number;
  lastSentAt: string | null;
}

export const NOTIFY_GUEST_EVENT = 'notification.send_email';

export interface NotifyGuestEvent {
  reservationId: string;
  guestName: string;
  guestEmail: string;
}
