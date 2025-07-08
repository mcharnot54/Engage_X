console.log("Stack Auth Environment Variables:");
console.log(
  "NEXT_PUBLIC_STACK_PROJECT_ID:",
  process.env.NEXT_PUBLIC_STACK_PROJECT_ID ? "✓ Set" : "✗ Missing",
);
console.log(
  "NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY:",
  process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY ? "✓ Set" : "✗ Missing",
);
console.log(
  "STACK_SECRET_SERVER_KEY:",
  process.env.STACK_SECRET_SERVER_KEY ? "✓ Set" : "✗ Missing",
);
