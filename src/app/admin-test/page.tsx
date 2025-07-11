"use client";

export default function AdminTestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Admin Test Page</h1>
      <p>This is a minimal test page to verify routing works.</p>
      <a href="/admin" className="text-blue-600 underline">
        Go to Admin
      </a>
    </div>
  );
}
