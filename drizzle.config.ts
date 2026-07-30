import { defineConfig } from 'drizzle-kit';

const connectionString = process.env.PGDATABASE_URL || process.env.DATABASE_URL;

export default defineConfig(
  connectionString
    ? {
        schema: './src/lib/db/schema/index.ts',
        out: './src/lib/db/migrations',
        dialect: 'postgresql',
        dbCredentials: { url: connectionString },
      }
    : {
        schema: './src/lib/db/schema/index.ts',
        out: './src/lib/db/migrations',
        dialect: 'postgresql',
        dbCredentials: {
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432'),
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_NAME || 'nodecoda',
          ssl: false,
        },
      }
);