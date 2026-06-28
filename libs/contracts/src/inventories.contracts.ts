export const RESERVATION_CONFIRMED_EVENT = 'reservation.confirmed';
export const ROOM_UNAVAILABLE_EVENT = 'room.unavailable';

export interface ReservationConfirmedEvent {
  reservationId: string;
}

export interface RoomUnavailableEvent {
  reservationId: string;
}
