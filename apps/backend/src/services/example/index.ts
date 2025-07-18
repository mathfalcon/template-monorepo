import {ExampleRepository} from '~/repositories';
import {Example} from '~/shared';
import { PaginatedResponse, WithPagination} from '~/types/pagination';
import {GetExampleByIdDto} from './dtos';

export class ExampleService {
  private repository = new ExampleRepository();

  async getAllExamples(): Promise<Example[]> {
    return this.repository.findAll();
  }

  async getAllExamplesPaginated(
    args: WithPagination<{}>,
  ): Promise<PaginatedResponse<Example>> {
    return this.repository.findAllPaginated(args.pagination);
  }

  async getExample(args: GetExampleByIdDto): Promise<Example> {
    return this.repository.findById(args.id);
  }
}
