import {Request, Response} from 'express';
import {asyncHandler} from '~/middleware/errorHandler';
import {HealthService} from '~/services';

const healthService = new HealthService();

export class HealthController {
  // Basic health check - just returns 200 OK
  basic = asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({status: 'ok', timestamp: new Date().toISOString()});
  });

  // Detailed health check with all system information
  detailed = asyncHandler(async (req: Request, res: Response) => {
    const healthCheck = await healthService.performHealthCheck();

    // Set appropriate status code based on health
    const statusCode =
      healthCheck.status === 'healthy'
        ? 200
        : healthCheck.status === 'degraded'
        ? 200
        : 503;

    res.status(statusCode).json(healthCheck);
  });

  // Database health check only
  database = asyncHandler(async (req: Request, res: Response) => {
    const dbCheck = await healthService.checkDatabase();

    if (!dbCheck) {
      res.status(200).json({
        status: 'skipped',
        message: 'Database check skipped - DATABASE_URL not configured',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const statusCode = dbCheck.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json({
      status: dbCheck.status,
      timestamp: new Date().toISOString(),
      database: dbCheck,
    });
  });

  // Memory health check only
  memory = asyncHandler(async (req: Request, res: Response) => {
    const memoryCheck = healthService.checkMemory();

    const statusCode = memoryCheck.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json({
      status: memoryCheck.status,
      timestamp: new Date().toISOString(),
      memory: memoryCheck,
    });
  });

  // Readiness check - for Kubernetes readiness probes
  readiness = asyncHandler(async (req: Request, res: Response) => {
    const healthCheck = await healthService.performHealthCheck();

    // Readiness should only be true if all critical services are healthy
    const isReady = healthCheck.status === 'healthy';

    res.status(isReady ? 200 : 503).json({
      ready: isReady,
      status: healthCheck.status,
      timestamp: new Date().toISOString(),
    });
  });

  // Liveness check - for Kubernetes liveness probes
  liveness = asyncHandler(async (req: Request, res: Response) => {
    // Liveness check is simpler - just check if the app is running
    res.status(200).json({
      alive: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });
}
