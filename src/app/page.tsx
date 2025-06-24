import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome to PhoenixPGS
        </h1>
        <p className="text-xl text-slate-300 mb-8">
          Your business intelligence platform
        </p>
        <Link
          href="/login"
          className="inline-block bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
