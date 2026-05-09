import app from './app';
import { env } from './config';
import { connectDatabase } from './config/database';
import { logger } from './utils/logger';

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    const server = app.listen(env.PORT, () => {
      logger.info(
        {
          port: env.PORT,
          environment: env.NODE_ENV,
          healthCheck: `http://localhost:${env.PORT}/health`,
        },
        'Server started successfully'
      );
    });

    const gracefulShutdown = (signal: string): void => {
      logger.info({ signal }, 'Starting graceful shutdown');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    process.on('unhandledRejection', (reason: Error) => {
      logger.error({ err: reason }, 'Unhandled Rejection');
      throw reason;
    });

    process.on('uncaughtException', (error: Error) => {
      logger.error({ err: error }, 'Uncaught Exception');
      process.exit(1);
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
};

void startServer();
