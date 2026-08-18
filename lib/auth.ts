import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

// Reuses the app's existing Prisma singleton (see lib/prisma.ts) rather than
// letting the adapter construct its own client — same driver-adapter
// (@prisma/adapter-pg) connection the rest of the app already uses.
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
  },
});
