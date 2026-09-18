import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    // `prisma generate` does not need a real database, so a placeholder keeps
    // `npm install` working before DATABASE_URL is set. Migrations need the real URL.
    url: process.env.DATABASE_URL ?? "postgresql://user:password@localhost:5432/placeholder",
    // Only needed for `prisma migrate dev` when the database user can't create databases.
    ...(process.env.SHADOW_DATABASE_URL ? { shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL } : {}),
  },
});
