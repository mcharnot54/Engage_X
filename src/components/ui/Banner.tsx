import Link from "next/link";

interface BannerProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function Banner({ title, subtitle, className = "" }: BannerProps) {
  const navigationLinks = [
    { name: "Gaze", href: "/observation-form" },
    { name: "Transform", href: "/standards" },
    { name: "Insight", href: "/reporting" },
    { name: "Guardian", href: "/admin" },
  ];

  return (
    <div
      className={`bg-white text-red-600 py-6 px-8 mb-5 rounded-lg shadow-lg border border-gray-200 ${className}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-6">
          <img
            loading="lazy"
            srcSet="https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1"
            className="h-12 w-auto object-contain"
            alt="PhoenixPGS logo"
          />
          <div className="flex-1 mx-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-1 hidden lg:block">
              {title}
            </h1>
            {subtitle && (
              <p className="text-red-500 text-sm md:text-base opacity-90 hidden lg:block">
                {subtitle}
              </p>
            )}
          </div>
          <nav className="flex gap-4">
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="font-poppins font-medium text-red-600 hover:text-red-800 transition-colors duration-200 px-3 py-1 rounded hover:bg-red-50 whitespace-nowrap"
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
