import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

/**
 * Validates MongoDB replica set configuration for transaction support
 */
const validateReplicaSetSupport = async (): Promise<boolean> => {
  try {
    const admin = mongoose.connection.db?.admin();
    if (!admin) {
      logger.warn('Cannot access MongoDB admin interface');
      return false;
    }

    // Check if server supports replica sets
    const serverStatus = await admin.serverStatus();
    const replStatus = serverStatus.repl;

    if (!replStatus) {
      logger.warn({
        message: 'MongoDB is running in standalone mode',
        transactionsSupported: false,
        info: 'Transactions require replica set. See docs/MONGODB_REPLICA_SET_SETUP.md',
      });
      return false;
    }

    logger.info({
      message: 'MongoDB replica set detected',
      setName: replStatus.setName,
      primary: replStatus.primary,
      hosts: replStatus.hosts,
      transactionsSupported: true,
    });

    return true;
  } catch (error) {
    logger.error({ err: error }, 'Error checking replica set support');
    return false;
  }
};

/**
 * Tests transaction support by creating a test session
 */
const testTransactionSupport = async (): Promise<boolean> => {
  try {
    const session = await mongoose.startSession();
    await session.endSession();
    logger.info('Transaction support validated successfully');
    return true;
  } catch (error) {
    if (error instanceof Error) {
      logger.error({
        error: error.message,
        message: 'Transaction test failed',
        hint: 'MongoDB must be running as replica set. Run: npm run mongo:setup',
      });
    }
    return false;
  }
};

export const connectDatabase = async (): Promise<void> => {
  try {
    const options: mongoose.ConnectOptions = {
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      directConnection: false, // Allow replica set discovery
    };

    logger.info({
      message: 'Connecting to MongoDB...',
      uri: env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'), // Mask credentials
    });

    await mongoose.connect(env.MONGODB_URI, options);

    logger.info({
      message: 'MongoDB connected successfully',
      database: mongoose.connection.db?.databaseName,
      host: mongoose.connection.host,
    });

    // Validate replica set support
    const hasReplicaSet = await validateReplicaSetSupport();

    // Test transaction support
    const transactionsWork = await testTransactionSupport();

    if (!hasReplicaSet || !transactionsWork) {
      logger.warn({
        message: '⚠️  MongoDB transactions are NOT supported',
        reason: hasReplicaSet
          ? 'Transaction test failed'
          : 'MongoDB running in standalone mode',
        impact: 'Order creation and payment processing may fail',
        solution: 'Run: npm run mongo:setup (see docs/MONGODB_REPLICA_SET_SETUP.md)',
      });

      // In production, fail fast
      if (env.NODE_ENV === 'production') {
        logger.error('Production requires replica set for transactions');
        process.exit(1);
      }
    } else {
      logger.info('✓ MongoDB transactions are fully supported');
    }

    // Connection event handlers
    mongoose.connection.on('error', (error) => {
      logger.error({ err: error }, 'MongoDB connection error');
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      void mongoose.connection.close().then(() => {
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
      });
    });

    process.on('SIGTERM', () => {
      void mongoose.connection.close().then(() => {
        logger.info('MongoDB connection closed through SIGTERM');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to connect to MongoDB');
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error({ err: error }, 'Error closing MongoDB connection');
  }
};
