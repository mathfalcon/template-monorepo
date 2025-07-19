import {z} from 'zod';
import 'dotenv/config';

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3001),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_HOST: z.string().default('localhost'),
});

export const env = EnvSchema.safeParse(process.env);

if (!env.success) {
  console.error('Invalid environment variables:', z.treeifyError(env.error));
  process.exit(1);
}

export const {
  PORT,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  POSTGRES_DB,
  POSTGRES_PORT,
  POSTGRES_HOST,
} = env.data;
