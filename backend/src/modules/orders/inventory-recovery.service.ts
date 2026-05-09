import mongoose from 'mongoose';
import { Order } from './order.model';
import { Event } from '../events/event.model';
import { OrderStatus } from './order.interface';

export class InventoryRecoveryService {
  async cleanupExpiredOrders(): Promise<{
    processedCount: number;
    restoredInventory: Record<string, number>;
  }> {
    const now = new Date();
    const session = await mongoose.startSession();

    let processedCount = 0;
    const restoredInventory: Record<string, number> = {};

    try {
      const expiredOrders = await Order.find({
        status: OrderStatus.PENDING,
        expiresAt: { $lte: now },
      }).limit(100);

      for (const order of expiredOrders) {
        await session.withTransaction(async () => {
          const currentOrder = await Order.findOne({
            _id: order._id,
            status: OrderStatus.PENDING,
          }).session(session);

          if (!currentOrder) {
            return;
          }

          currentOrder.status = OrderStatus.CANCELLED;
          await currentOrder.save({ session });

          for (const line of currentOrder.tickets) {
            const result = await Event.updateOne(
              { _id: currentOrder.eventId },
              { $inc: { 'ticketTypes.$[elem].quantityAvailable': line.quantity } },
              {
                session,
                arrayFilters: [{ 'elem.name': line.ticketType }],
              }
            );

            if (result.modifiedCount === 1) {
              const key = `${currentOrder.eventId.toString()}-${line.ticketType}`;
              restoredInventory[key] = (restoredInventory[key] || 0) + line.quantity;
            }
          }

          processedCount++;
        });
      }

      return { processedCount, restoredInventory };
    } finally {
      await session.endSession();
    }
  }
}
