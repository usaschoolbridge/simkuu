/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare const globalThis: { _prisma?: any } & typeof global;

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("[db] DATABASE_URL not set — db calls will fail");
    return null;
  }
  try {
    const adapter = new PrismaPg({ connectionString });
    return new PrismaClient({ adapter } as any);
  } catch (e) {
    console.error("[db] Failed to create PrismaClient", e);
    return null;
  }
}

if (!globalThis._prisma) {
  globalThis._prisma = createPrismaClient();
}

export const db = globalThis._prisma;
