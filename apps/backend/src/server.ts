import express, {NextFunction, Request, Response} from 'express';

import {PORT} from './config/env';
import {errorHandler} from './middleware/errorHandler';
import {registerSwaggerRoutes} from './swagger';
import {RegisterRoutes} from './routes';

const app: express.Application = express();
app.use(express.json());

registerSwaggerRoutes(app);
RegisterRoutes(app);

// Global error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 API listening on http://localhost:${PORT}/api`);
});

export default app;
