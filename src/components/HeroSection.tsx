import { ArrowRight, Clock, Star, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HeroSection() {
  return (
    <section className="
      relative overflow-hidden
      bg-gradient-to-br from-orange-50 via-orange-100 to-orange-50
      py-12 md:py-16 lg:py-24
    ">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-300 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2" />

      <div className="container-fluid relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Text Content */}
          <div className="text-center lg:text-left space-y-6 md:space-y-8">
            <h1 className="
              text-4xl sm:text-5xl md:text-6xl lg:text-7xl
              font-extrabold text-gray-900 leading-tight
            ">
              Delicious Food
              <span className="block bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Delivered Fast
              </span>
            </h1>

            <p className="
              text-base sm:text-lg md:text-xl
              text-gray-600 leading-relaxed
              max-w-2xl mx-auto lg:mx-0
            ">
              Order your favorite meals from college fest vendors. Quick, easy, and delicious! 🍔🍕🍰
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
              <Feature icon={<Clock />} text="Fast Delivery" />
              <Feature icon={<Star />} text="Top Rated" />
              <Feature icon={<Zap />} text="Easy Ordering" />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/menu" className="
                inline-flex items-center justify-center gap-2
                px-8 py-4 text-lg font-bold
                bg-orange-500 text-white rounded-xl
                hover:bg-orange-600 active:bg-orange-700
                transform hover:scale-105 active:scale-100
                transition-all duration-200
                shadow-lg hover:shadow-xl
                focus-visible:ring-2 focus-visible:ring-orange-500
              ">
                <span>Order Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <Link to="/about" className="
                inline-flex items-center justify-center
                px-8 py-4 text-lg font-bold
                bg-white text-orange-500 rounded-xl
                border-2 border-orange-500
                hover:bg-orange-50 active:bg-orange-100
                transition-all duration-200
                shadow-md
                focus-visible:ring-2 focus-visible:ring-orange-500
              ">
                Learn More
              </Link>
            </div>
          </div>

          {/* Image/Illustration - hidden on mobile */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl blur-3xl opacity-20" />
              <div className="relative bg-white rounded-3xl p-8 lg:p-12 shadow-2xl">
                <div className="text-8xl lg:text-9xl text-center animate-bounce">
                  🍔🍕🍰
                </div>
                <p className="text-center mt-6 text-gray-600 font-medium text-lg">
                  Tasty meals waiting for you!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-700">
      <div className="w-8 h-8 flex items-center justify-center text-orange-500">
        {icon}
      </div>
      <span className="text-sm md:text-base font-medium">{text}</span>
    </div>
  );
}
