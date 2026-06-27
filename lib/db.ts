/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare const globalThis: { _prisma?: any } & typeof global;

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;
  try {
    const adapter = new PrismaPg({ connectionString });
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    } as any);
  } catch {
    return null;
  }
}

if (!globalThis._prisma) {
  globalThis._prisma = createPrismaClient();
}

const db = globalThis._prisma;
export { db };
