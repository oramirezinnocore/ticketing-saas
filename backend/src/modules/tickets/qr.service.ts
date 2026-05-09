import jwt from 'jsonwebtoken';
import { env } from '../../config';
import { UnauthorizedError, BadRequestError } from '../../utils/AppError';

interface QRTokenPayload {
  ticketCode: string;
  iat?: number;
  exp?: number;
}

export class QRService {
  private getQRSecret(): string {
    return env.JWT_SECRET;
  }

  generateSignedTicketToken(ticketCode: string, expiresInSeconds = 300): string {
    if (!ticketCode?.trim()) {
      throw new BadRequestError('Ticket code is required');
    }

    const payload: QRTokenPayload = {
      ticketCode: ticketCode.trim(),
    };

    return jwt.sign(payload, this.getQRSecret(), {
      expiresIn: expiresInSeconds,
    });
  }

  verifySignedTicketToken(token: string): string {
    if (!token?.trim()) {
      throw new BadRequestError('Token is required');
    }

    try {
      const decoded = jwt.verify(token, this.getQRSecret()) as QRTokenPayload;

      if (!decoded.ticketCode) {
        throw new UnauthorizedError('Invalid token payload');
      }

      return decoded.ticketCode;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('QR token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid QR token');
      }
      throw new UnauthorizedError('QR token verification failed');
    }
  }
}
