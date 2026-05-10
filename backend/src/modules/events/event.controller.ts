import { Request, Response } from 'express';
import { EventService } from './event.service';
import { CreateEventDTO } from './event.interface';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';

export class EventController {
  constructor(private readonly eventService: EventService = new EventService()) {}

  createEvent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // SECURITY: organizerId comes from authenticated JWT, not from request body
    const payload: CreateEventDTO = {
      ...req.body,
      organizerId: req.user!.userId, // Override any organizerId from body with authenticated user
    };
    const event = await this.eventService.createEvent(payload);
    sendSuccess(res, event, 201);
  });

  listEvents = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const events = await this.eventService.listEvents();
    sendSuccess(res, events, 200);
  });

  getEventById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const event = await this.eventService.getEventById(req.params.id);
    sendSuccess(res, event, 200);
  });

  deleteEvent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await this.eventService.deleteEvent(
      req.params.id,
      req.user!.userId,
      req.user!.role
    );
    sendSuccess(res, { message: 'Event deleted successfully' }, 200);
  });
}
