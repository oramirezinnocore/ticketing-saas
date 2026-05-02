export interface ITicket {
  id: string;
  eventId: string;
  orderId: string;
  userId: string;
  qrCode: string;
  isValidated: boolean;
  validatedAt?: Date;
  createdAt: Date;
}
