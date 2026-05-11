import { Types } from 'mongoose';
import { Event } from './event.model';
import { CreateEventDTO, IEvent, IEventDocument } from './event.interface';
import { UserService } from '../users/user.service';
import { UserRole } from '../users/user.interface';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../../utils/AppError';

export class EventService {
  constructor(private readonly userService: UserService = new UserService()) {}

  private toPublicEvent(doc: IEventDocument): IEvent {
    return {
      id: doc._id.toString(),
      title: doc.title,
      description: doc.description,
      date: doc.date,
      organizerId: doc.organizerId.toString(),
      ticketTypes: doc.ticketTypes.map((t) => ({
        name: t.name,
        price: t.price,
        quantity: t.quantity,
        quantityAvailable: t.quantityAvailable,
      })),
      coverImageUrl: doc.coverImageUrl,
      coverImageAlt: doc.coverImageAlt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  private parseEventDate(input: string | Date): Date {
    const date = input instanceof Date ? input : new Date(input);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestError('Invalid event date');
    }
    return date;
  }

  async createEvent(data: CreateEventDTO): Promise<IEvent> {
    const { title, description, organizerId, ticketTypes, coverImageUrl, coverImageAlt } = data;

    if (!ticketTypes?.length) {
      throw new ValidationError('At least one ticket type is required');
    }

    if (ticketTypes.some((t) => t.quantity <= 0)) {
      throw new ValidationError('Ticket quantity must be greater than 0');
    }

    if (!Types.ObjectId.isValid(organizerId)) {
      throw new BadRequestError('Invalid organizer id format');
    }

    const organizer = await this.userService.findUserById(organizerId);
    if (!organizer) {
      throw new NotFoundError('Organizer not found');
    }
    if (organizer.role !== UserRole.ORGANIZER) {
      throw new ForbiddenError('Events can only be created for users with the organizer role');
    }

    const date = this.parseEventDate(data.date);

    if (date < new Date()) {
      throw new BadRequestError('Event date must be in the future');
    }

    try {
      const event = await Event.create({
        title: title.trim(),
        description: description.trim(),
        date,
        organizerId: new Types.ObjectId(organizerId),
        ticketTypes: ticketTypes.map((t) => ({
          name: t.name.trim(),
          price: t.price,
          quantity: t.quantity,
          quantityAvailable: t.quantity,
        })),
        // Include cover image fields if provided
        ...(coverImageUrl && { coverImageUrl: coverImageUrl.trim() }),
        ...(coverImageAlt && { coverImageAlt: coverImageAlt.trim() }),
      });

      return this.toPublicEvent(event);
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'ValidationError') {
        throw new ValidationError(error.message);
      }
      throw error;
    }
  }

  async getEventById(id: string): Promise<IEvent> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid event id format');
    }

    const doc = await Event.findById(id);
    if (!doc) {
      throw new NotFoundError('Event not found');
    }

    return this.toPublicEvent(doc);
  }

  async listEvents(): Promise<IEvent[]> {
    const docs = await Event.find().sort({ date: 1 }).exec();
    return docs.map((d) => this.toPublicEvent(d));
  }

  async deleteEvent(id: string, userId: string, userRole: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid event id format');
    }

    const event = await Event.findById(id);
    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Authorization: Only event organizer or admin can delete
    if (userRole !== UserRole.ADMIN && event.organizerId.toString() !== userId) {
      throw new ForbiddenError('You do not have permission to delete this event');
    }

    await Event.findByIdAndDelete(id);
  }
}
