import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Clock, Package, CheckCircle, CreditCard, Banknote } from 'lucide-react';
import { VantaBackground } from '../components/VantaBackground';

export function MyOrders() {
  const { orders, user } = useApp();

  const userOrders = user?.role === 'student'
    ? orders.filter((o) => o.studentId === user.id).sort((a, b) =>
        new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      )
    : [];

  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      label: 'Pending',
    },
    preparing: {
      icon: Package,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      label: 'Preparing',
    },
    delivered: {
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      label: 'Delivered',
    },
  };

  if (!user || user.role !== 'student') {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="mb-4">Please login as a student to view your orders.</p>
            <Link to="/student/login">
              <Button>Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] py-8 relative overflow-hidden">
      {/* Vanta Animated Background */}
      <VantaBackground />

      <div className="relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="mb-8 text-gray-800">My Orders</h1>

        {userOrders.length === 0 ? (
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📦</span>
              </div>
              <h2 className="mb-2 text-gray-800">No orders yet</h2>
              <p className="text-gray-600 mb-6">
                Start ordering your favorite food from the fest!
              </p>
              <Link to="/menu">
                <Button>Browse Menu</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {userOrders.map((order) => {
              const status = statusConfig[order.status];
              const StatusIcon = status.icon;

              return (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                          <h3 className="text-gray-800 text-sm sm:text-base">Order #{order.id.slice(-8)}</h3>
                          <Badge className={`${status.color} text-white flex items-center gap-1 text-xs px-2 py-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-3">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }) : 'N/A'}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                          <div className="flex items-center gap-1">
                            {order.paymentType === 'online' ? (
                              <>
                                <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-secondary" />
                                <span>Online</span>
                              </>
                            ) : (
                              <>
                                <Banknote className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                <span>COD</span>
                              </>
                            )}
                          </div>
                          <span className="text-gray-400 hidden sm:inline">|</span>
                          <span>{order.items.length} items</span>
                          <span className="text-gray-400 hidden sm:inline">|</span>
                          <span className="text-primary font-semibold">₹{order.total}</span>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Link to={`/order-status/${order.id}`}>
                          <Button variant="outline" size="sm" className="w-full sm:w-auto">View Details</Button>
                        </Link>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-2">Items:</p>
                      <div className="flex flex-wrap gap-2">
                        {order.items.map((item) => (
                          <Badge key={item.id} variant="outline">
                            {item.name} x{item.quantity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
