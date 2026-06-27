/* eslint-disable @typescript-eslint/no-explicit-any */
// Prisma client singleton — avoids multiple connections in dev (hot reload)
// Using dynamic require because prisma generate hasn't run yet without a DB.

let db: any;

declare const globalThis: { _prisma?: any } & typeof global;

if (!globalThis._prisma) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require("@prisma/client");
    globalThis._prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  } catch {
    // PrismaClient not yet generated — run `npx prisma generate`
    globalThis._prisma = null;
  }
}

db = globalThis._prisma;

export { db };
