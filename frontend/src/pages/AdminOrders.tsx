import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { AdminSidebar } from '../components/AdminSidebar';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { CreditCard, Banknote, Search, Filter, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function AdminOrders() {
  const navigate = useNavigate();
  const { user, orders, updateOrderStatus, refreshOrders } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterPayment, setFilterPayment] = useState('All');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
    }
  }, [user, navigate]);

  // Auto-refresh orders every 10 seconds for real-time updates
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const interval = setInterval(() => {
      refreshOrders();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [user, refreshOrders]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  const departments = ['All', ...new Set(orders.map((o) => o.department).filter(Boolean))];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.studentName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (order.phone || '').includes(searchQuery) ||
      (order.id?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesDepartment = filterDepartment === 'All' || order.department === filterDepartment;
    const matchesPayment = filterPayment === 'All' || order.paymentType === filterPayment;
    return matchesSearch && matchesDepartment && matchesPayment;
  });

  const handleStatusChange = async (orderId: string, status: 'pending' | 'preparing' | 'delivered') => {
    setIsUpdating(orderId);
    try {
      await updateOrderStatus(orderId, status);
      toast.success('Order status updated successfully!');
      // Refresh orders to get the latest data
      await refreshOrders();
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update order status. Please try again.');
    } finally {
      setIsUpdating(null);
    }
  };

  // Listen for new orders (polling approach)
  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const checkForNewOrders = async () => {
      try {
        await refreshOrders();
      } catch (error) {
        console.error('Error checking for new orders:', error);
      }
    };

    // Check immediately when component mounts
    checkForNewOrders();

    // Set up polling every 5 seconds
    const interval = setInterval(checkForNewOrders, 5000);

    return () => clearInterval(interval);
  }, [user, refreshOrders]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshOrders();
      toast.success('Orders refreshed successfully!');
    } catch (error) {
      console.error('Refresh error:', error);
      toast.error('Failed to refresh orders. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-500',
    preparing: 'bg-blue-500',
    delivered: 'bg-green-500',
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <AdminSidebar />
      <div className="flex-1 p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-gray-800">Orders Management</h1>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search by name, phone, or order ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      <SelectValue placeholder="Filter by department" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept === 'All' ? 'All Departments' : dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterPayment} onValueChange={setFilterPayment}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4" />
                      <SelectValue placeholder="Filter by payment" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Payments</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="cod">COD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Orders ({filteredOrders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredOrders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No orders found</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Department/Class</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="text-xs text-gray-600">
                            {order.id.slice(-8)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-gray-800">{order.studentName}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{order.phone || 'N/A'}</p>
                              <p className="text-xs text-gray-500">{order.email || 'N/A'}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-sm">{order.department}</p>
                              <p className="text-xs text-gray-500">{order.class}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="text-sm text-gray-700 truncate" title={order.address}>
                                {order.address || 'N/A'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {order.items.slice(0, 2).map((item) => (
                                <p key={item.id} className="text-xs text-gray-600">
                                  {item.name} x{item.quantity}
                                </p>
                              ))}
                              {order.items.length > 2 && (
                                <p className="text-xs text-gray-500">
                                  +{order.items.length - 2} more
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-primary">₹{order.total}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {order.paymentType === 'online' ? (
                                <>
                                  <CreditCard className="w-4 h-4 text-secondary" />
                                  <span className="text-sm">Online</span>
                                </>
                              ) : (
                                <>
                                  <Banknote className="w-4 h-4 text-green-600" />
                                  <span className="text-sm">COD</span>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={order.status}
                              onValueChange={(value: 'pending' | 'preparing' | 'delivered') =>
                                handleStatusChange(order.id, value)
                              }
                              disabled={isUpdating === order.id}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">
                                  <Badge className={`${statusColors.pending} text-white`}>
                                    Pending
                                  </Badge>
                                </SelectItem>
                                <SelectItem value="preparing">
                                  <Badge className={`${statusColors.preparing} text-white`}>
                                    Preparing
                                  </Badge>
                                </SelectItem>
                                <SelectItem value="delivered">
                                  <Badge className={`${statusColors.delivered} text-white`}>
                                    Delivered
                                  </Badge>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            {isUpdating === order.id && (
                              <div className="text-xs text-gray-500 mt-1">Updating...</div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
