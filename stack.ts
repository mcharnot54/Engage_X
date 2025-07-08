import { StackServerApp } from "@stackframe/stack";

// Validate required environment variables
const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;
const publishableClientKey =
  process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY;
const secretServerKey = process.env.STACK_SECRET_SERVER_KEY;

if (!projectId || !publishableClientKey || !secretServerKey) {
  console.warn(
    "Stack Auth environment variables are not properly configured. Some features may not work correctly.",
  );
}

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  projectId: projectId || "st_proj_placeholder",
  publishableClientKey: publishableClientKey || "pk_placeholder",
  secretServerKey: secretServerKey || "sk_placeholder",
  urls: {
    signIn: "/handler/sign-in",
    signUp: "/handler/sign-up",
    afterSignIn: "/",
    afterSignUp: "/",
  },
});
