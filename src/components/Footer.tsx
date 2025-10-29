import { Facebook, Instagram, Twitter, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t mt-auto w-[100vw] md:w-full">
      <div className="container-fluid w-[100vw] md:w-full py-8 md:py-12 lg:py-16 px-0 sm:px-6 lg:px-12">
        {/* Grid: 1 col mobile, 2 cols tablet, 3 cols desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Brand Section */}
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-white text-2xl" role="img" aria-label="burger">🍔</span>
              </div>
              <h2 className="text-2xl font-bold text-orange-500">
                FestEats
              </h2>
            </div>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-xs mx-auto sm:mx-0">
              Your favorite food delivery app for college fests. Quick, easy, and delicious!
            </p>
          </div>

          {/* Contact Section */}
          <div className="text-center sm:text-left">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Contact Us</h3>
            <div className="space-y-3">
              {/* Touch-friendly phone link */}
              <a 
                href="tel:+919482456033"
                className="flex items-center justify-center sm:justify-start gap-3 text-gray-600 hover:text-orange-500 transition-colors group"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg group-hover:bg-orange-100 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-sm md:text-base">+91 94824 56033</span>
              </a>

              {/* Touch-friendly email link */}
              <a 
                href="mailto:ganapathigouda379@gmail.com"
                className="flex items-center justify-center sm:justify-start gap-3 text-gray-600 hover:text-orange-500 transition-colors group"
              >
                <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg group-hover:bg-orange-100 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-sm md:text-base break-all">ganapathigouda379@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="text-center sm:text-left sm:col-span-2 lg:col-span-1">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Follow Us</h3>
            {/* Touch-friendly social icons (min 44×44px) */}
            <div className="flex gap-3 justify-center sm:justify-start">
              <a
                href="#"
                aria-label="Follow us on Facebook"
                className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-orange-500 hover:text-white hover:scale-110 active:scale-95 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="Follow us on Instagram"
                className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-orange-500 hover:text-white hover:scale-110 active:scale-95 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="Follow us on Twitter"
                className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-orange-500 hover:text-white hover:scale-110 active:scale-95 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright - responsive text size */}
        <div className="border-t mt-8 pt-6 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            &copy; 2025 <span className="font-semibold text-orange-500">FestEats</span>. All rights reserved. Made with{' '}
            <span className="text-red-500" role="img" aria-label="love">❤️</span>{' '}
            for college students.
          </p>
        </div>
      </div>
    </footer>
  );
}
