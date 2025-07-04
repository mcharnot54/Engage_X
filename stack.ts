import { StackServerApp } from "@stackframe/stack";

// Check if we have all required environment variables
const hasRequiredEnvVars =
  process.env.NEXT_PUBLIC_STACK_PROJECT_ID &&
  process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY &&
  process.env.STACK_SECRET_SERVER_KEY;

export const stackServerApp = hasRequiredEnvVars
  ? new StackServerApp({
      tokenStore: "nextjs-cookie",
      projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID!,
      publishableClientKey:
        process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY!,
      secretServerKey: process.env.STACK_SECRET_SERVER_KEY!,
      urls: {
        signIn: "/handler/sign-in",
        signUp: "/handler/sign-up",
        afterSignIn: "/observation-form",
        afterSignUp: "/observation-form",
      },
    })
  : null;
