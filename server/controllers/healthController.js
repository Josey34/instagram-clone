import mongoose from 'mongoose';

/**
 * Health check controller
 * Returns the health status of the server and its dependencies
 */
export const getHealthStatus = async (req, res) => {
  try {
    // Check MongoDB connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbStatus,
        name: mongoose.connection.name || 'unknown'
      },
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
      }
    };

    // If database is not connected, return 503 (Service Unavailable)
    if (dbStatus !== 'connected') {
      return res.status(503).json({
        ...healthData,
        status: 'degraded',
        message: 'Database connection unavailable'
      });
    }

    res.status(200).json(healthData);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: error.message
    });
  }
};

/**
 * Simple liveness probe
 * Returns 200 if server is running (for Docker/K8s liveness checks)
 */
export const getLiveness = (req, res) => {
  res.status(200).json({ alive: true });
};

/**
 * Readiness probe
 * Returns 200 only if server is ready to accept traffic
 */
export const getReadiness = async (req, res) => {
  const dbReady = mongoose.connection.readyState === 1;

  if (dbReady) {
    res.status(200).json({ ready: true });
  } else {
    res.status(503).json({ ready: false, reason: 'Database not connected' });
  }
};