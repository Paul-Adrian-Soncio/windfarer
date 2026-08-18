"use client";

import { createAuthClient } from "better-auth/react";

// Same-origin, so no baseURL needed — every request goes to this app's own
// /api/auth/* routes (see app/api/auth/[...all]/route.ts).
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
