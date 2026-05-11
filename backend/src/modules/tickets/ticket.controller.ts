import { Request, Response, NextFunction } from 'express';
import { TicketService } from './ticket.service';
import { QRService } from './qr.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { BadRequestError, NotFoundError } from '../../utils/AppError';
import { Ticket } from './ticket.model';
import QRCode from 'qrcode';

export class TicketController {
  constructor(
    private readonly ticketService: TicketService = new TicketService(),
    private readonly qrService: QRService = new QRService()
  ) {}

  /**
   * Get user's tickets (wallet view)
   */
  getUserTickets = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const userId = req.user?.userId;

      if (!userId) {
        throw new BadRequestError('User ID not found in request');
      }

      const tickets = await Ticket.find({ userId })
        .populate('eventId', 'title date location coverImageUrl')
        .populate('orderId', 'total createdAt')
        .sort({ createdAt: -1 });

      const ticketsWithQR = await Promise.all(
        tickets.map(async (ticket) => {
          const signedToken = this.qrService.generateSignedTicketToken(ticket.code);

          let qrCodeDataUrl: string | undefined;
          try {
            qrCodeDataUrl = await QRCode.toDataURL(signedToken, {
              errorCorrectionLevel: 'M',
              type: 'image/png',
              width: 300,
              margin: 1,
            });
          } catch (error) {
            qrCodeDataUrl = undefined;
          }

          return {
            id: ticket._id.toString(),
            code: ticket.code,
            orderId: ticket.orderId.toString(),
            eventId: ticket.eventId,
            status: ticket.status,
            qrCode: qrCodeDataUrl,
            signedToken,
            createdAt: ticket.createdAt,
            updatedAt: ticket.updatedAt,
          };
        })
      );

      sendSuccess(res, ticketsWithQR, 200);
    }
  );

  /**
   * Get single ticket details with QR
   */
  getTicketById = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const { id } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        throw new BadRequestError('User ID not found in request');
      }

      const ticket = await Ticket.findById(id)
        .populate('eventId', 'title date location coverImageUrl')
        .populate('orderId', 'total createdAt');

      if (!ticket) {
        throw new NotFoundError('Ticket not found');
      }

      if (ticket.userId.toString() !== userId) {
        throw new BadRequestError('Not authorized to view this ticket');
      }

      const signedToken = this.qrService.generateSignedTicketToken(ticket.code);

      let qrCodeDataUrl: string | undefined;
      try {
        qrCodeDataUrl = await QRCode.toDataURL(signedToken, {
          errorCorrectionLevel: 'M',
          type: 'image/png',
          width: 400,
          margin: 1,
        });
      } catch (error) {
        qrCodeDataUrl = undefined;
      }

      sendSuccess(
        res,
        {
          id: ticket._id.toString(),
          code: ticket.code,
          orderId: ticket.orderId,
          eventId: ticket.eventId,
          status: ticket.status,
          qrCode: qrCodeDataUrl,
          signedToken,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt,
        },
        200
      );
    }
  );

  /**
   * Validate ticket (scanner endpoint)
   */
  validateTicket = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const { token } = req.body as { token: string };

      if (!token) {
        throw new BadRequestError('Token is required');
      }

      // Verify signed token and extract ticket code
      const ticketCode = this.qrService.verifySignedTicketToken(token);

      // Find ticket
      const ticket = await this.ticketService.findTicketByCode(ticketCode);
      if (!ticket) {
        throw new NotFoundError('Ticket not found');
      }

      // Mark as used (atomic operation)
      const usedTicket = await this.ticketService.markTicketUsed(ticketCode);

      // Populate event details
      const populatedTicket = await Ticket.findById(usedTicket.id).populate(
        'eventId',
        'title date location'
      );

      sendSuccess(
        res,
        {
          success: true,
          ticket: {
            id: usedTicket.id,
            code: usedTicket.code,
            status: usedTicket.status,
            eventId: populatedTicket?.eventId,
          },
          message: 'Ticket validated and marked as used',
        },
        200
      );
    }
  );

  /**
   * Check ticket status without marking as used
   */
  checkTicketStatus = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const { token } = req.body as { token: string };

      if (!token) {
        throw new BadRequestError('Token is required');
      }

      const ticketCode = this.qrService.verifySignedTicketToken(token);

      const ticket = await this.ticketService.findTicketByCode(ticketCode);
      if (!ticket) {
        throw new NotFoundError('Ticket not found');
      }

      const populatedTicket = await Ticket.findById(ticket.id).populate(
        'eventId',
        'title date location'
      );

      sendSuccess(
        res,
        {
          id: ticket.id,
          code: ticket.code,
          status: ticket.status,
          eventId: populatedTicket?.eventId,
        },
        200
      );
    }
  );
}
