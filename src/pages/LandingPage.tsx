import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { VantaBackground } from '../components/VantaBackground';
import { ChevronRight, Clock, Shield, Star } from 'lucide-react';

export function LandingPage() {
  const features = [
    {
      icon: Clock,
      title: 'Fast Delivery',
      description: 'Get your food delivered quickly during college fests',
    },
    {
      icon: Shield,
      title: 'Secure Payment',
      description: 'Multiple payment options with secure transactions',
    },
    {
      icon: Star,
      title: 'Quality Food',
      description: 'Hygienic and delicious food from trusted vendors',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Vanta Animated Background */}
      <VantaBackground />
      
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="py-20 px-4 min-h-[600px] flex items-center">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to{' '}
              <span className="text-golden">
                FestEats
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Your favorite food delivery solution for college festivals. Order delicious meals
              with ease and enjoy hassle-free dining!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/menu">
                <Button size="lg" className="text-lg px-8">
                  Browse Menu
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/student/login">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-white/80 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
              Why Choose FestEats?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-2 bg-white/90 backdrop-blur-sm">
                    <CardContent className="pt-6 text-center">
                      <div className="w-16 h-16 bg-gradient-golden rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-900">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-golden">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Order?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of students enjoying delicious food at college fests!
            </p>
            <Link to="/student/register">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 bg-white text-golden hover:bg-gray-100"
              >
                Register Now
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
