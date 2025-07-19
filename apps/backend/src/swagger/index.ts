import express from 'express';
import * as swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.json';

/**
 * Register Swagger Routes
 * @param app Express.App
 */
export function registerSwaggerRoutes(app: express.Application) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.info('Swagger route registered');

  app.get('/swagger.json', async (req, res, next) => {
    try {
      res.json(swaggerDocument);
    } catch (e) {
      return next({status: 404, message: 'Not found swagger.json file'});
    }
  });
}
