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
      <div className="flex gap-5 max-lg:flex-col max-lg:gap-0">
        <div className="flex flex-col line-height-normal w-1/2 max-lg:ml-0 max-lg:w-full">
          <img
            loading="lazy"
            srcSet="https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1?width=100 100w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1?width=200 200w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1?width=400 400w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1?width=800 800w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1?width=1200 1200w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1?width=1600 1600w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1?width=2000 2000w, https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2Ffc537553103a4d70a5a4479611a565c1"
            className="aspect-[2.53] object-cover object-center w-full mt-5 min-h-5 min-w-5 overflow-hidden"
            alt="Company Logo"
          />
        </div>
        <div className="flex flex-col line-height-normal w-1/2 ml-5 max-lg:ml-0 max-lg:w-full">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">{title}</h1>
                {subtitle && (
                  <p className="text-red-500 text-lg opacity-90">{subtitle}</p>
                )}
              </div>
              <nav className="flex gap-6">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="font-poppins font-medium text-red-600 hover:text-red-800 transition-colors duration-200 px-3 py-1 rounded hover:bg-red-50"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
