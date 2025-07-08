import { StackServerApp } from "@stackframe/stack";

// Check if we have all required environment variables and they're not placeholder values
const hasRequiredEnvVars =
  process.env.NEXT_PUBLIC_STACK_PROJECT_ID &&
  process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY &&
  process.env.STACK_SECRET_SERVER_KEY &&
  process.env.NEXT_PUBLIC_STACK_PROJECT_ID !== "st_proj_placeholder" &&
  process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY !== "pk_placeholder" &&
  process.env.STACK_SECRET_SERVER_KEY !== "sk_placeholder";

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
        afterSignIn: "/",
        afterSignUp: "/",
      },
    })
  : null;
