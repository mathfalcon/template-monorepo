import express, {NextFunction, Request, Response} from 'express';
import routes from './routes';
import healthRouter from './routes/health';
import {PORT} from './config/env';
import {errorHandler} from './middleware/errorHandler';

const app: express.Application = express();
app.use(express.json());

// Health check routes (accessible at root level)
app.use('/health', healthRouter);

// Mount all API routes under /api
app.use('/api', routes);

// Global error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 API listening on http://localhost:${PORT}/api`);
});

export default app;
