"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-red-600 mb-4">
          Something went wrong
        </h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">
          A global error occurred
        </h2>
        <p className="text-gray-500 mb-8">
          Please refresh the page or contact support.
        </p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
