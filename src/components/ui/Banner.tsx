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
  );
}
