// prisma.config.ts
import { defineConfig, env } from "prisma/config";
import * as dotenv from "dotenv";

// Carrega automaticamente o .env na raiz do projeto
dotenv.config({ path: "./.env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
