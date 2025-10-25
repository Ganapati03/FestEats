import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowRight, Utensils, Clock, CreditCard } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1561394496-4cff45d85822?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xsZWdlJTIwZm9vZCUyMGZlc3RpdmFsfGVufDF8fHx8MTc2MDA3ODI2NHww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="College Food Festival"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
        </div>

        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            Order Your Favorite Food During the Fest 🍔
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-200">
            Skip the queue, enjoy the fest! Quick orders, instant delivery.
          </p>
          <Link to="/menu">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all">
              Order Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-center mb-12 text-gray-800">Why Choose FestEats?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-orange-50 to-white shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-8 h-8 text-white" />
              </div>
              <h3 className="mb-2 text-gray-800">Wide Variety</h3>
              <p className="text-gray-600">
                Choose from snacks, meals, and drinks. Something for everyone!
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-white shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="mb-2 text-gray-800">Quick Delivery</h3>
              <p className="text-gray-600">
                Get your food delivered fast so you can enjoy the fest!
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-orange-50 to-white shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
              <h3 className="mb-2 text-gray-800">Flexible Payment</h3>
              <p className="text-gray-600">
                Pay online via Razorpay or choose Cash on Delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-white">Ready to Order?</h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of students enjoying delicious food at the fest!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/student/register">
              <Button size="lg" variant="secondary" className="rounded-full px-8">
                Create Account
              </Button>
            </Link>
            <Link to="/menu">
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 bg-white/10 text-white border-white hover:bg-white hover:text-primary"
              >
                Browse Menu
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
