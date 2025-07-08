import { StackServerApp } from "@stackframe/stack";

// Validate required environment variables
const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;
const publishableClientKey =
  process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY;
const secretServerKey = process.env.STACK_SECRET_SERVER_KEY;

const isStackConfigured = projectId && publishableClientKey && secretServerKey;

if (!isStackConfigured) {
  console.warn(
    "Stack Auth environment variables are not properly configured. Authentication features will be disabled.",
  );
}

// Only create StackServerApp if properly configured
export const stackServerApp = isStackConfigured
  ? new StackServerApp({
      tokenStore: "nextjs-cookie",
      projectId,
      publishableClientKey,
      secretServerKey,
      urls: {
        signIn: "/handler/sign-in",
        signUp: "/handler/sign-up",
        afterSignIn: "/",
        afterSignUp: "/",
      },
    })
  : null;
