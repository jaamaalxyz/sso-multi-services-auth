import mongoose from 'mongoose';

// Define connection state interface
interface ConnectionState {
  isConnected: boolean;
  connectionAttempts: number;
  maxRetries: number;
  retryDelay: number;
  healthCheckInterval: NodeJS.Timeout | null;
  isShuttingDown: boolean;
}

// Initialize connection state
const connectionState: ConnectionState = {
  isConnected: false,
  connectionAttempts: 0,
  maxRetries: 5,
  retryDelay: 5000,
  healthCheckInterval: null,
  isShuttingDown: false,
};

// Define connection options
const getConnectionOptions = () => ({
  maxPoolSize: 15,
  minPoolSize: 3,
  maxIdleTimeMS: 300000,
  serverSelectionTimeoutMS: 15000,
  connectTimeoutMS: 15000,
  retryWrites: true,
  retryReads: true,
  bufferCommands: false,
  heartbeatFrequencyMS: 30000,
  family: 4 as const,
  appName: process.env.SERVICE_NAME || 'sso-service',
});

// Console logger (simplified - you can replace with your preferred logger)
const logger = {
  info: (message: string, meta?: unknown) => {
    console.log(
      `✅ [${new Date().toISOString()}] ${message}`,
      meta ? JSON.stringify(meta, null, 2) : ''
    );
  },
  warn: (message: string, meta?: unknown) => {
    console.warn(
      `⚠️ [${new Date().toISOString()}] ${message}`,
      meta ? JSON.stringify(meta, null, 2) : ''
    );
  },
  error: (message: string, meta?: unknown) => {
    console.error(
      `❌ [${new Date().toISOString()}] ${message}`,
      meta ? JSON.stringify(meta, null, 2) : ''
    );
  },
};

// Handle connection errors with exponential backoff
const handleConnectionError = async (error: Error): Promise<void> => {
  logger.error(
    `MongoDB connection failed (Attempt ${
      connectionState.connectionAttempts + 1
    }): ${error.message}`
  );

  connectionState.connectionAttempts++;

  if (connectionState.connectionAttempts >= connectionState.maxRetries) {
    logger.error(
      `Failed to connect after ${connectionState.maxRetries} attempts. Exiting...`
    );
    process.exit(1);
  }

  const delay =
    connectionState.retryDelay *
    Math.pow(2, connectionState.connectionAttempts - 1);
  logger.info(`Retrying connection in ${delay / 1000}s...`);

  setTimeout(() => {
    dbConnect().catch((err) => logger.error('Retry connection failed:', err));
  }, delay);
};

// Setup mongoose event listeners
const setupEventListeners = (): void => {
  const connection = mongoose.connection;

  // Remove existing listeners to prevent duplicates
  connection.removeAllListeners();

  connection.on('connected', () => {
    logger.info('✅ Mongoose connected to MongoDB');
    connectionState.isConnected = true;
  });

  connection.on('disconnected', () => {
    logger.warn('🔌 Mongoose disconnected from MongoDB');
    connectionState.isConnected = false;
  });

  connection.on('reconnected', () => {
    logger.info('🔄 Mongoose reconnected to MongoDB');
    connectionState.isConnected = true;
  });

  connection.on('error', (error: Error) => {
    logger.error(`Mongoose connection error: ${error.message}`);

    // Handle specific network errors
    if (
      error.message.includes('ECONNRESET') ||
      error.message.includes('MongoNetworkError') ||
      error.message.includes('MongoServerSelectionError')
    ) {
      logger.warn(
        'MongoDB Network error detected, will attempt reconnection...',
        {
          error: error.message,
          connectionState: mongoose.connection.readyState,
        }
      );
      connectionState.isConnected = false;
    }
  });
};

// Setup graceful shutdown handlers
const setupGracefulShutdown = (): void => {
  const gracefulShutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received. Closing MongoDB connection...`);
    connectionState.isShuttingDown = true;

    if (connectionState.healthCheckInterval) {
      clearInterval(connectionState.healthCheckInterval);
    }

    try {
      await mongoose.connection.close();
      logger.info('🔌 MongoDB connection closed gracefully');
    } catch (error) {
      logger.error(
        `Error closing MongoDB connection: ${(error as Error).message}`
      );
    }

    process.exit(0);
  };

  // Handle various shutdown signals
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));
};

// Main connection function
const dbConnect = async (): Promise<typeof mongoose.connection> => {
  // Return existing connection if already connected
  if (mongoose.connection.readyState === 1) {
    logger.info('📡 MongoDB already connected, reusing existing connection');
    return mongoose.connection;
  }

  // Wait for in-progress connection
  if (mongoose.connection.readyState === 2) {
    logger.info('⏳ MongoDB connection in progress, waiting...');
    return new Promise((resolve, reject) => {
      mongoose.connection.once('connected', () => resolve(mongoose.connection));
      mongoose.connection.once('error', reject);
    });
  }

  // Get MongoDB URI from environment variables
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('❌ MONGODB_URI is not defined in environment variables');
  }

  const options = getConnectionOptions();

  try {
    logger.info(
      `🔄 Attempting to connect to MongoDB... (Attempt ${
        connectionState.connectionAttempts + 1
      })`
    );

    await mongoose.connect(mongoUri, options);

    connectionState.isConnected = true;
    connectionState.connectionAttempts = 0;

    logger.info(
      `✅ MongoDB Connected: ${mongoose.connection.host} - DB: ${mongoose.connection.db?.databaseName}`
    );

    // Setup event listeners and graceful shutdown
    setupEventListeners();
    setupGracefulShutdown();

    return mongoose.connection;
  } catch (error) {
    await handleConnectionError(error as Error);
    throw error; // Re-throw for caller to handle
  }
};

// Get connection statistics
const getConnectionStats = () => {
  const readyStates = [
    'disconnected',
    'connected',
    'connecting',
    'disconnecting',
  ];

  return {
    readyState: readyStates[mongoose.connection.readyState] || 'unknown',
    connectionAttempts: connectionState.connectionAttempts,
    isConnected: connectionState.isConnected,
    host: mongoose.connection.host,
    databaseName: mongoose.connection.db?.databaseName,
    collections: mongoose.connection.db?.collections
      ? Object.keys(mongoose.connection.db.collections).length
      : 0,
  };
};

export { dbConnect, getConnectionStats, connectionState };
