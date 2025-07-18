import {z} from 'zod';

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3001),
});

export const env = EnvSchema.safeParse(process.env);

if (!env.success) {
  console.error('Invalid environment variables:', z.treeifyError(env.error));
  process.exit(1);
}

export const {PORT} = env.data;
