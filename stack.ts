import { StackServerApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID || "st_proj_placeholder",
  publishableClientKey:
    process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY || "pk_placeholder",
  secretServerKey: process.env.STACK_SECRET_SERVER_KEY || "sk_placeholder",
  urls: {
    signIn: "/handler/sign-in",
    signUp: "/handler/sign-up",
    afterSignIn: "/",
    afterSignUp: "/",
  },
});
