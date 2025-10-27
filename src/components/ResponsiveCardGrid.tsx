import { ReactNode } from 'react';

interface ResponsiveCardGridProps {
  children: ReactNode;
  className?: string;
}

export function ResponsiveCardGrid({ children, className = '' }: ResponsiveCardGridProps) {
  return (
    <div className={`
      grid gap-4 sm:gap-6 lg:gap-8
      grid-cols-1 
      sm:grid-cols-2 
      lg:grid-cols-3 
      xl:grid-cols-4
      ${className}
    `}>
      {children}
    </div>
  );
}

// Example Food Card Component
interface FoodCardProps {
  name: string;
  price: number;
  image: string;
  category: string;
  rating?: number;
}

export function FoodCard({ name, price, image, category, rating = 4.5 }: FoodCardProps) {
  return (
    <div className="
      bg-white rounded-xl shadow-md overflow-hidden
      hover:shadow-xl active:shadow-md
      transition-all duration-300
      card-hover
      focus-within:ring-2 focus-within:ring-orange-500
    ">
      {/* Image Container - fixed aspect ratio */}
      <div className="relative aspect-video overflow-hidden bg-gray-200">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-orange-600">
            {category}
          </span>
        </div>
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full">
          <span className="text-yellow-400">★</span>
          <span className="text-xs font-bold">{rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-5">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {name}
        </h3>
        
        <div className="flex items-center justify-between mt-4">
          <span className="text-2xl font-bold text-orange-500">
            ₹{price}
          </span>
          <button className="
            btn-touch
            bg-orange-500 text-white
            hover:bg-orange-600 active:bg-orange-700
            font-semibold rounded-lg
            focus-visible:ring-2 focus-visible:ring-orange-500
          ">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
