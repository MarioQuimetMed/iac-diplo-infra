export const RESERVATION_REQUESTED_EVENT = 'reservation.requested';
export const RESERVATION_CONFIRMED_EVENT = 'reservation.confirmed';
export const ROOM_UNAVAILABLE_EVENT = 'room.unavailable';

export interface ReservationRequestedEvent {
  reservationId: string;
  roomId: string;
  guestName: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
}

export interface ReservationConfirmedEvent {
  reservationId: string;
}

export interface RoomUnavailableEvent {
  reservationId: string;
}
