import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { CreditCard, Banknote, ShoppingBag } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { toast } from 'sonner';

export function Checkout() {
  const navigate = useNavigate();
  const { cart, user, placeOrder } = useApp();
  const [loading, setLoading] = useState(false);
  const [paymentType, setPaymentType] = useState<'online' | 'cod'>('cod');
  const [address, setAddress] = useState('');
  const [activeScanner, setActiveScanner] = useState<{ image: string; description?: string } | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch active scanner for online payments
  useState(() => {
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
  });

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <h2 className="mb-2 text-gray-800">Please Login</h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to checkout.
            </p>
            <Button onClick={() => navigate('/student/login')}>
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="mb-2 text-gray-800">Your Cart is Empty</h2>
            <p className="text-gray-600 mb-6">
              Add some items to your cart before checkout.
            </p>
            <Button onClick={() => navigate('/menu')}>
              Browse Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 20;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      toast.error('Please enter your delivery address');
      return;
    }

    setLoading(true);
    try {
      const orderId = await placeOrder(paymentType, address);
      toast.success('Order placed successfully!');
      navigate(`/order-status/${orderId}`);
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resolveImageUrl = (imageUrl: string) => {
    if (!imageUrl) return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400';
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/')) return `${API_BASE}${imageUrl}`;
    return imageUrl;
  };

  return (
    <div className="min-h-[calc(100vh-64px)] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="mb-8 text-gray-800">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input value={user.name} disabled className="mt-1" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input value={user.email} disabled className="mt-1" />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input value={user.phone} disabled className="mt-1" />
                  </div>
                  <div>
                    <Label>Department</Label>
                    <Input value={user.department} disabled className="mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Address</CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your full delivery address (Room number, Hostel/Building, etc.)"
                  className="mt-1 min-h-[100px]"
                  required
                />
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentType} onValueChange={(value: 'online' | 'cod') => setPaymentType(value)}>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Banknote className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-gray-500">Pay when you receive your order</p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="online" id="online" />
                    <Label htmlFor="online" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="w-5 h-5 text-secondary" />
                      <div>
                        <p className="font-medium">Online Payment</p>
                        <p className="text-sm text-gray-500">Pay using UPI/Cards</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {/* Show Scanner for Online Payment */}
                {paymentType === 'online' && activeScanner && (
                  <div className="mt-4 p-4 border rounded-lg bg-blue-50">
                    <p className="text-sm font-medium text-blue-900 mb-2">
                      Scan QR Code to Pay
                    </p>
                    <div className="flex justify-center">
                      <img
                        src={activeScanner.image}
                        alt="Payment QR Code"
                        className="max-w-[200px] max-h-[200px] border-2 border-blue-200 rounded"
                      />
                    </div>
                    {activeScanner.description && (
                      <p className="text-sm text-blue-700 mt-2 text-center">
                        {activeScanner.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-600 mt-2 text-center">
                      After payment, click "Place Order" below
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={resolveImageUrl(item.imageUrl)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Qty: {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-800">
                        ₹{item.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-800">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="text-gray-800">₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary">₹{total}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={loading || !address.trim()}
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By placing your order, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
