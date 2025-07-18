import {Request, Response, NextFunction} from 'express';
import {ExampleService} from '~/services';
import {asyncHandler} from '~/middleware/errorHandler';
import {GetExampleByIdRouteSchema} from '~/routes';
import {TypedRequest} from '~/types';
import {ensurePagination} from '~/middleware';

const service = new ExampleService();

export class ExampleController {
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const examples = await service.getAllExamples();
    res.json(examples);
  });

  getAllPaginated = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    ensurePagination(req, res, next);
    const examples = await service.getAllExamplesPaginated({
      pagination: req.pagination!,
    });
    res.json(examples);
  });

  getOne = asyncHandler(
    async (
      req: TypedRequest<typeof GetExampleByIdRouteSchema>,
      res: Response,
    ) => {
      const example = await service.getExample({id: req.params.id});
      res.json(example);
    },
  );
}
