import { Router } from 'express';
import { PaymentController } from './payment.controller';

const router = Router();
const paymentController = new PaymentController();

router.post('/preference', paymentController.createPreference);

router.post('/webhook', paymentController.handleWebhook);

router.get('/order/:orderId', paymentController.getPaymentByOrderId);

router.get('/:id', paymentController.getPaymentById);

export default router;
