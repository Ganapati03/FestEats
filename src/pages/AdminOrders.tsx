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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { CreditCard, Banknote, Search, Filter, RefreshCw, Upload, Eye } from 'lucide-react';
import { toast } from 'sonner';

export function AdminOrders() {
  const navigate = useNavigate();
  const { user, orders, updateOrderStatus, refreshOrders } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterPayment, setFilterPayment] = useState('All');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
      return;
    }

    // Initial data fetch
    refreshOrders();
  }, [user, navigate, refreshOrders]);

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

  const handleScannerUpload = async (orderId: string, file: File) => {
    setUploadingOrderId(orderId);
    try {
      // Validate file
      if (!file.type.startsWith('image/jpeg')) {
        toast.error('Only JPG images are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('scannerImage', file);

      const response = await fetch(`${API_BASE}/api/orders/${orderId}/scanner`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      toast.success('Scanner image uploaded successfully!');
      await refreshOrders();
    } catch (error: any) {
      console.error('Scanner upload error:', error);
      toast.error(error?.message || 'Failed to upload scanner image');
    } finally {
      setUploadingOrderId(null);
    }
  };

  const handleFileSelect = (orderId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleScannerUpload(orderId, file);
    }
  };

  const handleStatusChange = async (orderId: string, status: 'pending' | 'preparing' | 'delivered') => {
    setIsUpdating(orderId);
    try {
      await updateOrderStatus(orderId, status);
      toast.success('Order status updated successfully!');
      await refreshOrders();
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update order status. Please try again.');
    } finally {
      setIsUpdating(null);
    }
  };

  const resolveImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshOrders();
      toast.success('Orders refreshed successfully!');
    } catch (error) {
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
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
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
                      placeholder="Search orders..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-11" // Larger touch target
                    />
                  </div>
                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger className="h-11">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        <SelectValue placeholder="Department" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept: string) => (
                        <SelectItem key={dept} value={dept}>
                          {dept === 'All' ? 'All Departments' : dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterPayment} onValueChange={setFilterPayment}>
                    <SelectTrigger className="h-11 sm:col-span-2 lg:col-span-1">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        <SelectValue placeholder="Payment" />
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

            {/* Orders Table/Cards - Professional styling */}
            <Card>
              <CardHeader>
                <CardTitle>All Orders ({filteredOrders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredOrders.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No orders found</p>
                ) : (
                  <>
                    {/* Desktop Table (hidden on mobile) */}
                    <div className="hidden lg:block overflow-x-auto">
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
                                      {order.scannerImage ? (
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="ml-2 p-1 h-6 w-6"
                                            >
                                              <Eye className="w-3 h-3" />
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="max-w-md">
                                            <DialogHeader>
                                              <DialogTitle>Payment Proof</DialogTitle>
                                            </DialogHeader>
                                            <div className="flex justify-center">
                                              <img
                                                src={resolveImageUrl(order.scannerImage)}
                                                alt="Payment proof"
                                                className="max-w-full max-h-96 object-contain"
                                              />
                                            </div>
                                          </DialogContent>
                                        </Dialog>
                                      ) : (
                                        <div className="ml-2">
                                          <input
                                            type="file"
                                            accept="image/jpeg"
                                            onChange={(e) => handleFileSelect(order.id, e)}
                                            className="hidden"
                                            id={`scanner-${order.id}`}
                                            disabled={uploadingOrderId === order.id}
                                          />
                                          <label htmlFor={`scanner-${order.id}`}>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="p-1 h-6 w-6"
                                              asChild
                                            >
                                              <span>
                                                <Upload className="w-3 h-3" />
                                              </span>
                                            </Button>
                                          </label>
                                          {uploadingOrderId === order.id && (
                                            <span className="text-xs text-gray-500 ml-1">Uploading...</span>
                                          )}
                                        </div>
                                      )}
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

                    {/* Mobile Card View (hidden on desktop) */}
                    <div className="lg:hidden space-y-4">
                      {filteredOrders.map((order) => (
                        <Card key={order.id} className="border-l-4 border-l-primary">
                          <CardContent className="p-4">
                            {/* Order Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <p className="font-semibold text-gray-800">{order.studentName}</p>
                                <p className="text-xs text-gray-500">#{order.id.slice(-8)}</p>
                              </div>
                              <Badge className={`${statusColors[order.status as keyof typeof statusColors]} text-white text-xs px-2 py-1`}>
                                {order.status}
                              </Badge>
                            </div>

                            {/* Order Details Grid */}
                            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                              <div>
                                <p className="text-gray-500 text-xs">Phone</p>
                                <p className="text-gray-800">{order.phone || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs">Department</p>
                                <p className="text-gray-800">{order.department}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs">Class</p>
                                <p className="text-gray-800">{order.class}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 text-xs">Total</p>
                                <p className="text-primary font-semibold">₹{order.total}</p>
                              </div>
                            </div>

                            {/* Items Summary */}
                            <div className="bg-gray-50 rounded p-2 mb-3">
                              <p className="text-xs text-gray-600 mb-1">Items:</p>
                              {order.items.slice(0, 2).map((item) => (
                                <p key={item.id} className="text-xs text-gray-700">
                                  • {item.name} ×{item.quantity}
                                </p>
                              ))}
                              {order.items.length > 2 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  +{order.items.length - 2} more items
                                </p>
                              )}
                            </div>

                            {/* Payment Type */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {order.paymentType === 'online' ? (
                                  <>
                                    <CreditCard className="w-4 h-4 text-secondary" />
                                    <span className="text-sm">Online Payment</span>
                                  </>
                                ) : (
                                  <>
                                    <Banknote className="w-4 h-4 text-green-600" />
                                    <span className="text-sm">Cash on Delivery</span>
                                  </>
                                )}
                              </div>
                              {order.paymentType === 'online' && order.scannerImage && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>Payment Proof</DialogTitle>
                                    </DialogHeader>
                                    <div className="flex justify-center">
                                      <img
                                        src={resolveImageUrl(order.scannerImage)}
                                        alt="Payment proof"
                                        className="max-w-full max-h-96 object-contain"
                                      />
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>

                            {/* Status Update */}
                            <Select
                              value={order.status}
                              onValueChange={(value: 'pending' | 'preparing' | 'delivered') =>
                                handleStatusChange(order.id, value)
                              }
                              disabled={isUpdating === order.id}
                            >
                              <SelectTrigger className="w-full h-11">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">
                                  <Badge className={`${statusColors.pending} text-white`}>Pending</Badge>
                                </SelectItem>
                                <SelectItem value="preparing">
                                  <Badge className={`${statusColors.preparing} text-white`}>Preparing</Badge>
                                </SelectItem>
                                <SelectItem value="delivered">
                                  <Badge className={`${statusColors.delivered} text-white`}>Delivered</Badge>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            {isUpdating === order.id && (
                              <p className="text-xs text-gray-500 text-center mt-2">Updating...</p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
