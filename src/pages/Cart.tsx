import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, CreditCard, Banknote, Sparkles, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { VantaBackground } from '../components/VantaBackground';
import confetti from 'canvas-confetti';

export function Cart() {
  const navigate = useNavigate();
  const { cart, updateCartItemQuantity, removeFromCart, placeOrder, user } = useApp();
  const [paymentType, setPaymentType] = useState<'online' | 'cod'>('online');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeScanner, setActiveScanner] = useState<{ image: string; description?: string } | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Load active scanner when component mounts
  useEffect(() => {
    const fetchScanner = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/scanner/active`);
        if (response.ok) {
          const data = await response.json();
          setActiveScanner(data);
        }
      } catch (error) {
        console.error('Failed to fetch scanner:', error);
      }
    };
    fetchScanner();
  }, [API_BASE]);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const resolveImageUrl = (imageUrl: string) => {
    if (!imageUrl) return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400';
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/')) return `${API_BASE}${imageUrl}`;
    return imageUrl;
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!address.trim()) {
      toast.error('Please enter your delivery address');
      return;
    }

    setLoading(true);
    try {
      const orderId = await placeOrder(paymentType, address);

      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF7B00', '#007BFF', '#FFD700'],
      });

      toast.success('Order placed successfully! 🎉');
      setTimeout(() => {
        navigate(`/order-status/${orderId}`);
      }, 1000);
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'student') {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="mb-4">Please login as a student to view your cart.</p>
            <Button onClick={() => navigate('/student/login')}>Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 relative overflow-hidden">
        <VantaBackground />
        <div className="relative z-10">
          <Card className="max-w-md text-center">
            <CardContent className="pt-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🛒</span>
              </div>
              <h2 className="mb-2 text-gray-800">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some delicious items to get started!</p>
              <Button onClick={() => navigate('/menu')}>Browse Menu</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] py-8 relative overflow-hidden">
      <VantaBackground />
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="mb-8 text-gray-800">Your Cart</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={resolveImageUrl(item.imageUrl)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-gray-800">{item.name}</h3>
                            <p className="text-sm text-gray-500">{item.category}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              try {
                                await removeFromCart(item.id);
                                toast.success('Item removed from cart');
                              } catch (error) {
                                toast.error('Failed to remove item');
                              }
                            }}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await updateCartItemQuantity(item.id, item.quantity - 1);
                                } catch (error) {
                                  toast.error('Failed to update quantity');
                                }
                              }}
                              className="w-8 h-8 p-0"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  await updateCartItemQuantity(item.id, item.quantity + 1);
                                } catch (error) {
                                  toast.error('Failed to update quantity');
                                }
                              }}
                              className="w-8 h-8 p-0"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <span className="text-lg text-primary">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Checkout Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal ({cart.length} items)</span>
                      <span>₹{total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="text-green-600">FREE</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span>Total</span>
                      <span className="text-xl text-primary">₹{total}</span>
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Delivery Address
                    </Label>
                    <Textarea
                      placeholder="Enter your complete delivery address (hostel room, building, etc.)"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="min-h-[80px]"
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Payment Method</Label>
                    <RadioGroup value={paymentType} onValueChange={(v: 'online' | 'cod') => setPaymentType(v)}>
                      <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                        <RadioGroupItem value="online" id="online" />
                        <Label htmlFor="online" className="flex-1 cursor-pointer flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-secondary" />
                          UPI (Online)
                          {paymentType === 'online' && activeScanner && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="ml-2 text-xs"
                                >
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  Scan to Pay
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Scan QR Code to Pay</DialogTitle>
                                </DialogHeader>
                                <div className="flex justify-center">
                                  <img
                                    src={activeScanner.image}
                                    alt="Payment QR Code"
                                    className="max-w-full max-h-96 object-contain"
                                  />
                                </div>
                                {activeScanner.description && (
                                  <p className="text-sm text-gray-600 text-center mt-2">
                                    {activeScanner.description}
                                  </p>
                                )}
                              </DialogContent>
                            </Dialog>
                          )}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="flex-1 cursor-pointer flex items-center gap-2">
                          <Banknote className="w-4 h-4 text-green-600" />
                          Cash on Delivery
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={loading}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </Button>

                  <p className="text-xs text-center text-gray-500">
                    By placing this order, you agree to our terms and conditions
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
