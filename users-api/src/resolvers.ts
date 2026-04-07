import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// Lazy-initialised singleton — avoids opening DB connections at import time
// (useful for test environments that mock the DB).
let _prisma: PrismaClient | undefined;

const handler: ProxyHandler<PrismaClient> = {
  get(_target, prop) {
    if (!_prisma) {
      const adapter = new PrismaMariaDb(process.env.DATABASE_URL!);
      _prisma = new PrismaClient({ adapter });
    }
    return (_prisma as any)[prop];
  },
};

export const prisma = new Proxy({} as PrismaClient, handler);
