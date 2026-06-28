import { Injectable, Logger } from '@nestjs/common';
import { OrderCreatedEvent, NotificationsStatusResponse, NotifyGuestEvent } from '@app/contracts';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  private readonly sentByCustomer = new Map<string, { count: number; last: string }>();

  handleOrderCreated(event: OrderCreatedEvent): void {
    this.logger.log(
      `Enviando notificacion a ${event.customer} por orden ${event.orderId} ($${event.total})`,
    );

    const prev = this.sentByCustomer.get(event.customer);
    this.sentByCustomer.set(event.customer, {
      count: (prev?.count ?? 0) + 1,
      last: new Date().toISOString(),
    });
  }

  getStatus(customer: string): NotificationsStatusResponse {
    const entry = this.sentByCustomer.get(customer);
    return {
      customer,
      sent: entry?.count ?? 0,
      lastSentAt: entry?.last ?? null,
    };
  }

  handleNotifyGuest(event: NotifyGuestEvent): void {
    this.logger.log(`Enviando correo de confirmación a ${event.guestEmail} (${event.guestName}) para la reserva ${event.reservationId}...`);

    const prev = this.sentByCustomer.get(event.guestEmail);
    this.sentByCustomer.set(event.guestEmail, {
      count: (prev?.count ?? 0) + 1,
      last: new Date().toISOString(),
    });
    this.logger.log(`¡Correo enviado exitosamente a ${event.guestEmail}!`);
  }
}
