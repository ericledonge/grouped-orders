import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const clientBaseURL =
  typeof window !== "undefined"
    ? window.location.origin // En mode client = utilise l'URL actuelle
    : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"; // En mode SSR

export const authClient = createAuthClient({
  baseURL: clientBaseURL,
  plugins: [adminClient()],
});
