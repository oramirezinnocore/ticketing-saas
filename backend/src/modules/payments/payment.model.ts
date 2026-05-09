import { Schema, model } from 'mongoose';
import { IPaymentDocument, PaymentStatus } from './payment.interface';

const paymentSchema = new Schema<IPaymentDocument>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    externalId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    webhookProcessed: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>): Record<string, unknown> => {
        ret.id = (ret._id as { toString: () => string }).toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

paymentSchema.index({ orderId: 1, status: 1 });
paymentSchema.index({ externalId: 1, webhookProcessed: 1 });

export const Payment = model<IPaymentDocument>('Payment', paymentSchema);
