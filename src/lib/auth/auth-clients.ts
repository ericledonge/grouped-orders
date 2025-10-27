import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const clientBaseURL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

console.log("🌐 [Better Auth Client Config]");
console.log("  NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL);
console.log(
  "  window.location.origin:",
  typeof window !== "undefined" ? window.location.origin : "N/A (SSR)",
);
console.log("  → baseURL used:", clientBaseURL);

export const authClient = createAuthClient({
  baseURL: clientBaseURL,
  plugins: [adminClient()],
});
