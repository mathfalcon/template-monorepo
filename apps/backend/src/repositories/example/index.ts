import { Example } from '~/shared'
import { db } from '~/db'
import { PaginationOptions, PaginatedResponse } from '~/types/pagination'
import { createPaginatedResponse } from '~/middleware/pagination'
import { NotFoundError } from '~/errors'


export class ExampleRepository {
  async findAll(): Promise<Example[]> {
    const rows = await db
      .selectFrom('examples')
      .selectAll()
      .execute()

    return rows.map(this.mapToExample)
  }

  async findAllPaginated(options: PaginationOptions): Promise<PaginatedResponse<Example>> {
    // Get total count
    const totalResult = await db
      .selectFrom('examples')
      .select(db.fn.count('id').as('total'))
      .executeTakeFirst()

    const total = Number(totalResult?.total || 0)

    // Get paginated data
    let query = db
      .selectFrom('examples')
      .selectAll()

    // Apply sorting based on field
    if (options.sortBy === 'name') {
      query = query.orderBy('name', options.sortOrder)
    } else if (options.sortBy === 'createdAt') {
      query = query.orderBy('createdAt', options.sortOrder)
    } else {
      query = query.orderBy('createdAt', 'desc') // default
    }

    const rows = await query
      .limit(options.limit)
      .offset(options.offset)
      .execute()

    const data = rows.map(this.mapToExample)

    return createPaginatedResponse(data, total, options)
  }

  async findById(id: string): Promise<Example> {
    const row = await db
      .selectFrom('examples')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst()

    if (!row) {
      throw new NotFoundError('Example not found')
    }

    return this.mapToExample(row)
  }

  private mapToExample(row: any): Example {
    return {
      id: row.id,
      name: row.name,
      createdAt: row.createdAt,
    }
  }
}
