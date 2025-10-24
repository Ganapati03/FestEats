import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { AdminSidebar } from '../components/AdminSidebar';
import { ShoppingBag, DollarSign, CreditCard, Banknote, TrendingUp, Upload, QrCode } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, orders, uploadScanner, activeScanner } = useApp();
  const [scannerFile, setScannerFile] = useState<File | null>(null);
  const [scannerDescription, setScannerDescription] = useState('');
  const [uploadingScanner, setUploadingScanner] = useState(false);

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

  const handleUploadScanner = async () => {
    if (!scannerFile) {
      toast.error('Please select a scanner image');
      return;
    }

    setUploadingScanner(true);
    try {
      await uploadScanner(scannerFile, scannerDescription);
      toast.success('Scanner image uploaded successfully!');
      setScannerFile(null);
      setScannerDescription('');
    } catch (error) {
      toast.error('Failed to upload scanner image');
    } finally {
      setUploadingScanner(false);
    }
  };

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

          {/* Scanner Management */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Payment Scanner Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeScanner ? (
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-green-800 font-medium">Active Scanner</p>
                      <p className="text-sm text-green-600">
                        Students can view this QR code during online payment checkout
                      </p>
                      {activeScanner.description && (
                        <p className="text-sm text-gray-600 mt-1">{activeScanner.description}</p>
                      )}
                    </div>
                    <img
                      src={activeScanner.image}
                      alt="Active Scanner"
                      className="w-16 h-16 object-contain border rounded"
                    />
                  </div>
                ) : (
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No active scanner image</p>
                    <p className="text-sm text-gray-500">Upload a QR code or payment scanner image for students</p>
                  </div>
                )}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      {activeScanner ? 'Update Scanner Image' : 'Upload Scanner Image'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Upload Payment Scanner Image</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="scanner-file">Scanner Image (JPG only, max 5MB)</Label>
                        <Input
                          id="scanner-file"
                          type="file"
                          accept="image/jpeg"
                          onChange={(e) => setScannerFile(e.target.files?.[0] || null)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="scanner-description">Description (optional)</Label>
                        <Textarea
                          id="scanner-description"
                          placeholder="e.g., UPI QR Code for FestEats payments"
                          value={scannerDescription}
                          onChange={(e) => setScannerDescription(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <Button
                        onClick={handleUploadScanner}
                        disabled={!scannerFile || uploadingScanner}
                        className="w-full"
                      >
                        {uploadingScanner ? 'Uploading...' : 'Upload Scanner'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
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
