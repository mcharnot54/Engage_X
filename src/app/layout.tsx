import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins, Montserrat } from "next/font/google";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackServerApp } from "../../stack";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PhoenixPGS",
  description: "PhoenixPGS Observation Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${montserrat.variable} antialiased`}
      >
        {stackServerApp ? (
          <StackProvider app={stackServerApp}>
            <StackTheme>{children}</StackTheme>
          </StackProvider>
        ) : (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md mx-auto text-center p-6">
              <h1 className="text-2xl font-bold text-red-600 mb-4">
                Stack Auth Configuration Required
              </h1>
              <div className="text-left bg-white p-4 rounded-lg border shadow-sm">
                <p className="text-sm text-gray-700 mb-4">
                  To use this application, you need to configure Stack Auth
                  environment variables in your{" "}
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    .env.local
                  </code>{" "}
                  file:
                </p>
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                  {`NEXT_PUBLIC_STACK_PROJECT_ID="your_project_id"
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="your_key"
STACK_SECRET_SERVER_KEY="your_secret"`}
                </pre>
                <p className="text-xs text-gray-600 mt-3">
                  Get these credentials from{" "}
                  <a
                    href="https://app.stack-auth.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Stack Auth Dashboard
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
