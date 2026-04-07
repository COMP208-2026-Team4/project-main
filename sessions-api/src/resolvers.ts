import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

let _prisma: PrismaClient | null = null;

function initPrisma() {
  if (_prisma) return _prisma;

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl)
    throw new Error("DATABASE_URL is not set");

  const url = new URL(databaseUrl);
  const adapter = new PrismaMariaDb({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3307,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
  });

  _prisma = new PrismaClient({ adapter });
  return _prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (initPrisma() as any)[prop];
  }
});