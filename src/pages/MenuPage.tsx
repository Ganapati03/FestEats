import { useState } from 'react';
import { Search, ShoppingCart } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { VantaBackground } from '../components/VantaBackground';
import { Link } from 'react-router-dom';

export function MenuPage() {
  const { menuItems, addToCart, cart, user } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Meals', 'Snacks', 'Drinks'];

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.available;
  });

  const handleAddToCart = async (item: typeof menuItems[0]) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return;
    }
    if (user.role !== 'student') {
      toast.error('Only students can order food');
      return;
    }
    try {
      await addToCart(item);
      toast.success(`${item.name} added to cart!`);
    } catch (error) {
      toast.error('Failed to add item to cart. Please try again.');
    }
  };

  const cartItemCount = cart.reduce((sum: number, item) => sum + item.quantity, 0);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Helper to resolve image URLs
  const resolveImageUrl = (imageUrl: string) => {
    if (!imageUrl) return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400';
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/')) return `${API_BASE}${imageUrl}`;
    return imageUrl;
  };

  return (
    <div className="py-8 relative overflow-hidden">
      {/* Vanta Background */}
      <VantaBackground />
      
      <div className="relative z-10">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="mb-2 text-gray-800">Food Menu</h1>
            <p className="text-gray-600">Choose your favorite dishes and order now!</p>
          </div>

          {/* Search and Filter */}
          <div className="max-w-4xl mx-auto mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search for food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className="rounded-full"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Food Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {filteredItems.map((item) => {
              console.log('Rendering item:', item.name, 'Image:', item.imageUrl);
              return (
                <Card
                  key={item.id}
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative h-48 overflow-hidden">
                    <ImageWithFallback
                      src={resolveImageUrl(item.imageUrl)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-2 right-2 bg-white text-gray-800">
                      {item.category}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="mb-2 text-gray-800">{item.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl text-primary">₹{item.price}</span>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(item)}
                        className="rounded-full"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No items found matching your criteria.</p>
            </div>
          )}

          {/* Floating Cart Button */}
          {user?.role === 'student' && cartItemCount > 0 && (
            <Link to="/cart">
              <Button
                size="lg"
                className="fixed bottom-8 right-8 rounded-full shadow-lg hover:shadow-xl w-16 h-16 p-0"
              >
                <div className="relative">
                  <ShoppingCart className="w-6 h-6" />
                  <span className="absolute -top-2 -right-2 bg-white text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    {cartItemCount}
                  </span>
                </div>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
