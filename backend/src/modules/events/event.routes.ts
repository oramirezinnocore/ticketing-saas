import { Router } from 'express';
import { body, param } from 'express-validator';
import { EventController } from './event.controller';
import { validateRequest } from '../../middlewares/validateRequest';

const router = Router();
const eventController = new EventController();

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const ticketTypesValidator = body('ticketTypes').custom((value: unknown) => {
  if (!Array.isArray(value) || value.length < 1) {
    throw new Error('At least one ticket type is required');
  }
  for (const entry of value) {
    if (!isPlainRecord(entry)) {
      throw new Error('Invalid ticket type entry');
    }
    const name = entry.name;
    const price = entry.price;
    const quantity = entry.quantity;
    if (typeof name !== 'string' || !name.trim()) {
      throw new Error('Each ticket type must have a name');
    }
    if (typeof price !== 'number' || Number.isNaN(price) || price < 0) {
      throw new Error('Each ticket type must have a valid price >= 0');
    }
    if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1) {
      throw new Error('Each ticket type must have an integer quantity of at least 1');
    }
  }
  return true;
});

router.post(
  '/',
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 300 })
      .withMessage('Title must not exceed 300 characters'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('date')
      .notEmpty()
      .withMessage('Date is required')
      .custom((value) => {
        const d = value instanceof Date ? value : new Date(value as string);
        if (Number.isNaN(d.getTime())) {
          throw new Error('Invalid event date');
        }
        return true;
      }),
    body('organizerId')
      .notEmpty()
      .withMessage('Organizer id is required')
      .isMongoId()
      .withMessage('Invalid organizer id'),
    ticketTypesValidator,
    validateRequest,
  ],
  eventController.createEvent
);

router.get('/', eventController.listEvents);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid event id'), validateRequest],
  eventController.getEventById
);

export default router;
