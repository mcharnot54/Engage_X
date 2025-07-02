interface BannerProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function Banner({ title, subtitle, className = "" }: BannerProps) {
  return (
    <div
      className={`bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 px-8 mb-5 rounded-lg shadow-lg ${className}`}
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{title}</h1>
        {subtitle && (
          <p className="text-blue-100 text-lg opacity-90">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
