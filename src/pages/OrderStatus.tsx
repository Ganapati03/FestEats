import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Clock, Package, CheckCircle, CreditCard, Banknote, Loader2 } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface OrderItem {
  id: string;
  name: string;
  imageUrl: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  class: string;
  phone: string;
  email: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'delivered';
  paymentType: 'online' | 'cod';
}

export function OrderStatus() {
  const { orderId } = useParams();
  const { orders, user, refreshOrders } = useApp();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      
      // First try to find in existing orders
      const existingOrder = orders.find((o) => o.id === orderId);
      if (existingOrder) {
        setOrder(existingOrder);
        setLoading(false);
        return;
      }

      // If not found, try to refresh orders and fetch from backend
      try {
        await refreshOrders();
        const refreshedOrder = orders.find((o) => o.id === orderId);
        if (refreshedOrder) {
          setOrder(refreshedOrder);
        } else {
          // Try to fetch specific order from backend
          const token = localStorage.getItem('token');
          if (token && user) {
            const endpoint = user.role === 'admin' ? `${API_BASE}/api/orders` : `${API_BASE}/api/orders/my`;
            const response = await axios.get(endpoint, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const backendOrder = response.data.find((o: any) => o._id === orderId);
            if (backendOrder) {
              const mappedOrder: Order = {
                id: backendOrder._id,
                studentId: backendOrder.userId?._id || backendOrder.userId,
                studentName: backendOrder.userId?.name || 'Unknown',
                department: backendOrder.department,
                class: backendOrder.class,
                phone: backendOrder.userId?.phone || '',
                email: backendOrder.userId?.email || '',
                items: backendOrder.items.map((item: any) => ({
                  ...item.foodId,
                  id: item.foodId._id,
                  imageUrl: item.foodId.image,
                  quantity: item.quantity,
                  price: item.foodId.price
                })),
                total: backendOrder.totalAmount,
                status: backendOrder.deliveryStatus,
                paymentType: backendOrder.paymentType
              };
              setOrder(mappedOrder);
            }
          }
        }
      } catch (error) {
        // Error already handled in UI with loading state
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, orders, refreshOrders, user, API_BASE]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <h2 className="mb-2 text-gray-800">Loading Order...</h2>
            <p className="text-gray-600">
              Please wait while we fetch your order details.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <Card className="max-w-md text-center">
          <CardContent className="pt-6">
            <h2 className="mb-2 text-gray-800">Order Not Found</h2>
            <p className="text-gray-600 mb-6">
              The order you're looking for doesn't exist.
            </p>
            <Link to="/menu">
              <Button>Back to Menu</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      label: 'Pending',
    },
    preparing: {
      icon: Package,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      label: 'Preparing',
    },
    delivered: {
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      label: 'Delivered',
    },
  };

  const currentStatus = statusConfig[order.status];

  return (
    <div className="min-h-[calc(100vh-64px)] py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="mb-8 text-gray-800">Order Status</h1>

        {/* Success Message */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="mb-2 text-gray-800">Order Placed Successfully! 🎉</h2>
            <p className="text-gray-600">
              Your order has been received and is being processed.
            </p>
          </CardContent>
        </Card>

        {/* Progress Tracker */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-8">
              {(['pending', 'preparing', 'delivered'] as const).map((status, index) => {
                const config = statusConfig[status];
                const Icon = config.icon;
                const isActive = status === order.status;
                const isPast =
                  (status === 'pending') ||
                  (status === 'preparing' && order.status === 'delivered');

                return (
                  <div key={status} className="flex-1 flex flex-col items-center relative">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                        isActive || isPast
                          ? config.color + ' text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-sm ${
                        isActive || isPast ? config.textColor : 'text-gray-400'
                      }`}
                    >
                      {config.label}
                    </span>
                    {index < 2 && (
                      <div
                        className={`absolute top-6 left-1/2 w-full h-0.5 -z-10 ${
                          isPast ? config.color : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className={`p-4 rounded-lg ${currentStatus.bgColor}`}>
              <p className={`text-center ${currentStatus.textColor}`}>
                {order.status === 'pending' && 'Your order has been received and is pending confirmation.'}
                {order.status === 'preparing' && 'Your delicious food is being prepared!'}
                {order.status === 'delivered' && 'Your order has been delivered. Enjoy your meal!'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Order ID</p>
                <p className="text-gray-800">{order.id}</p>
              </div>
              <div>
                <p className="text-gray-500">Payment Type</p>
                <div className="flex items-center gap-2 mt-1">
                  {order.paymentType === 'online' ? (
                    <>
                      <CreditCard className="w-4 h-4 text-secondary" />
                      <span>Online Payment</span>
                    </>
                  ) : (
                    <>
                      <Banknote className="w-4 h-4 text-green-600" />
                      <span>Cash on Delivery</span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <p className="text-gray-500">Student Name</p>
                <p className="text-gray-800">{order.studentName}</p>
              </div>
              <div>
                <p className="text-gray-500">Phone</p>
                <p className="text-gray-800">{order.phone}</p>
              </div>
              <div>
                <p className="text-gray-500">Department</p>
                <p className="text-gray-800">{order.department}</p>
              </div>
              <div>
                <p className="text-gray-500">Class</p>
                <p className="text-gray-800">{order.class}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <ImageWithFallback
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-gray-800">{item.name}</h4>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-primary">₹{item.price * item.quantity}</p>
                </div>
              </div>
            ))}
            <div className="flex justify-between pt-4 border-t">
              <span>Total Amount</span>
              <span className="text-2xl text-primary">₹{order.total}</span>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex justify-center gap-4">
          <Link to="/menu">
            <Button variant="outline">Order More</Button>
          </Link>
          <Link to="/orders">
            <Button>View All Orders</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
