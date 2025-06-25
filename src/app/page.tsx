import Link from "next/link";

export default function HomePage() {
  return (
    <div className="pointer-events-auto text-gray-300 bg-white">
      <div className="bg-black text-gray-300 pointer-events-auto">
        <div className="mb-[200px] bg-white">
          <div className="flex gap-5 max-md:flex-col max-md:gap-0">
            {/* First Column - Empty for spacing */}
            <div className="flex flex-col w-1/3 max-md:w-full max-md:ml-0" />

            {/* Second Column - Main Content */}
            <div className="flex flex-col w-1/3 ml-5 max-md:w-full max-md:ml-0">
              {/* Top Image Section */}
              <div className="flex flex-col relative min-h-[352px] p-5">
                <section className="flex flex-col relative min-h-[352px] p-5 w-full self-stretch flex-grow max-w-[1200px] mx-auto" />
                <img
                  loading="lazy"
                  src="https://cdn.builder.io/api/v1/image/assets%2F9ce0f418d64249b18f0cb96e0afc51db%2F9540c05b913c42ac9eca0746ebb9464b?width=2000"
                  className="block aspect-[2.98] object-cover w-full mt-5 min-h-[20px] min-w-[20px] overflow-hidden pointer-events-auto"
                  alt="PhoenixPGS"
                />
              </div>

              {/* Welcome Content Section */}
              <div className="flex items-center bg-white justify-center min-h-[200px] pointer-events-auto mb-auto">
                <div className="text-center pointer-events-auto">
                  <p className="text-[28px] text-red-600 leading-7 mb-8">
                    <b>Your Performance Guidance Platform</b>
                  </p>
                  <Link
                    href="/login"
                    className="inline-block bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
                  >
                    Sign In
                  </Link>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="flex flex-col relative min-h-[100px] px-5 pb-5">
                <section className="flex flex-col relative min-h-[100px] px-5 pb-5 w-full self-stretch flex-grow max-w-[1200px] mx-auto" />
              </div>
            </div>

            {/* Third Column - Empty for spacing */}
            <div className="flex flex-col w-1/3 ml-5 max-md:w-full max-md:ml-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
