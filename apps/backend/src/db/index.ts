import {CamelCasePlugin, Kysely, PostgresDialect} from 'kysely';
import {Pool} from 'pg';
import {Example} from '~/shared';

export interface Database {
  examples: Example;
}

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
    }),
  }),
  plugins: [new CamelCasePlugin()],
});
