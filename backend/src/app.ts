import express, { Application, Request, Response } from 'express';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { corsMiddleware, helmetMiddleware, rateLimiter } from './middlewares/security';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import { requestLogger } from './middlewares/requestLogger';
import { sendSuccess } from './utils/response';
import { swaggerSpec } from './config/swagger';

import { authRoutes } from './modules/auth';
import { userRoutes } from './modules/users';
import { eventRoutes } from './modules/events';
import { ticketRoutes } from './modules/tickets';
import { orderRoutes } from './modules/orders';
import { paymentRoutes } from './modules/payments';
import { uploadRoutes } from './modules/upload';

const app: Application = express();

const API_PREFIX = '/api/v1';

app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(rateLimiter);
app.use(requestLogger);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (_req: Request, res: Response) => {
  sendSuccess(
    res,
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    200
  );
});

// Swagger API Documentation
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Ticketing SaaS API Documentation',
  })
);

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/events`, eventRoutes);
app.use(`${API_PREFIX}/tickets`, ticketRoutes);
app.use(`${API_PREFIX}/orders`, orderRoutes);
app.use(`${API_PREFIX}/payments`, paymentRoutes);
app.use(`${API_PREFIX}/upload`, uploadRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
