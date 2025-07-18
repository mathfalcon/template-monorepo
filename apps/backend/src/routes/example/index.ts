import {Router} from 'express';
import {ExampleController} from '~/controllers';
import {paginationMiddleware, validateRequest} from '~/middleware';
import {GetExampleByIdRouteSchema} from './validation';

const exampleRouter: Router = Router();
const ctrl = new ExampleController();

// GET    /api/examples          - Get all examples (non-paginated)
exampleRouter.get('/', ctrl.getAll.bind(ctrl));

// GET    /api/examples/paginated - Get paginated examples
exampleRouter.get(
  '/paginated',
  paginationMiddleware(10, 100),
  ctrl.getAllPaginated.bind(ctrl),
);

// GET    /api/examples/:id      - Get single example
exampleRouter.get(
  '/:id',
  validateRequest(GetExampleByIdRouteSchema),
  ctrl.getOne.bind(ctrl),
);

export default exampleRouter;

export * from './validation';
