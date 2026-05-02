import { Request, Response } from 'express';
import { EventService } from './event.service';
import { CreateEventDTO } from './event.interface';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';

export class EventController {
  constructor(private readonly eventService: EventService = new EventService()) {}

  createEvent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const payload = req.body as CreateEventDTO;
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
}
