import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

// Next.js's dev server hot-reloads server code on every file save, which
// would normally re-run this module and create a brand new PrismaClient
// (and a brand new database connection) each time. Stashing the client on
// `globalThis` survives hot-reloads in development, so we don't leak
// connections. In production this global is only ever set once anyway.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
