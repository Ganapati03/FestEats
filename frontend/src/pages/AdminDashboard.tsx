import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { AdminSidebar } from '../components/AdminSidebar';
import { ShoppingBag, DollarSign, CreditCard, Banknote, TrendingUp } from 'lucide-react';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, orders } = useApp();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const onlineOrders = orders.filter((o) => o.paymentType === 'online').length;
  const codOrders = orders.filter((o) => o.paymentType === 'cod').length;
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const preparingOrders = orders.filter((o) => o.status === 'preparing').length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;

  const stats = [
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: ShoppingBag,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Revenue',
      value: `₹${totalRevenue}`,
      icon: DollarSign,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Online Orders',
      value: onlineOrders,
      icon: CreditCard,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'COD Orders',
      value: codOrders,
      icon: Banknote,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <AdminSidebar />
      <div className="flex-1 p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="mb-8 text-gray-800">Dashboard</h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                        <p className="text-3xl text-gray-800">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${stat.textColor}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Status Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Order Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Pending</p>
                  <p className="text-4xl text-yellow-600">{pendingOrders}</p>
                </div>
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Preparing</p>
                  <p className="text-4xl text-blue-600">{preparingOrders}</p>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Delivered</p>
                  <p className="text-4xl text-green-600">{deliveredOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 5).reverse().map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="text-gray-800">
                          {order.studentName} - {order.department}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.items.length} items • {order.paymentType === 'online' ? 'Online' : 'COD'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-primary">₹{order.total}</p>
                        <p className="text-sm text-gray-600 capitalize">{order.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
