export const RESERVATION_REQUESTED_EVENT = 'reservation.requested';

export interface ReservationRequestedEvent {
  reservationId: string;
  roomId: string;
  guestName: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
}
