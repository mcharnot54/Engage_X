import { StackHandler } from "@stackframe/stack";
import Link from "next/link";

export default function Handler(props: any) {
  // Check if Stack Auth is configured
  const isStackConfigured = !!(
    process.env.NEXT_PUBLIC_STACK_PROJECT_ID &&
    process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY &&
    process.env.STACK_SECRET_SERVER_KEY
  );

  if (!isStackConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Authentication Not Configured
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Stack Auth environment variables are missing. Please configure
              authentication to use this feature.
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Return Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <StackHandler fullPage {...props} />;
}
