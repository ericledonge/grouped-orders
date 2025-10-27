import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

const baseURL =
  process.env.BETTER_AUTH_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
  "http://localhost:3000";

console.log("🔧 [Better Auth Server Config]");
console.log("  BETTER_AUTH_URL:", process.env.BETTER_AUTH_URL);
console.log("  VERCEL_URL:", process.env.VERCEL_URL);
console.log(
  "  BETTER_AUTH_SECRET:",
  process.env.BETTER_AUTH_SECRET ? "✅ SET" : "❌ MISSING",
);
console.log("  → baseURL used:", baseURL);

export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    "http://localhost:3000",
    "https://*.vercel.app", // Toutes les previews Vercel
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [admin(), nextCookies()],
});
