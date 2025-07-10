"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "white",
          }}
        >
          <div style={{ textAlign: "center", padding: "32px" }}>
            <h1
              style={{
                fontSize: "36px",
                fontWeight: "bold",
                color: "#dc2626",
                marginBottom: "16px",
              }}
            >
              Something went wrong
            </h1>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "600",
                color: "#4b5563",
                marginBottom: "16px",
              }}
            >
              A global error occurred
            </h2>
            <p
              style={{
                color: "#6b7280",
                marginBottom: "32px",
              }}
            >
              Please refresh the page or contact support.
            </p>
            <div
              style={{ display: "flex", gap: "16px", justifyContent: "center" }}
            >
              <button
                onClick={reset}
                style={{
                  backgroundColor: "#dc2626",
                  color: "white",
                  padding: "8px 24px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                style={{
                  backgroundColor: "#2563eb",
                  color: "white",
                  padding: "8px 24px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
