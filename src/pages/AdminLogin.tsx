import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useApp } from '../context/AppContext';
import { VantaBackground } from '../components/VantaBackground';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

export function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Admin login attempt:', formData.email);
      const user = await login(formData.email, formData.password, 'admin');
      console.log('Admin login successful:', user);

      if (user && user.role === 'admin') {
        toast.success('Admin login successful!');
        navigate('/admin/dashboard');
      } else {
        console.error('User role mismatch:', user?.role);
        toast.error('Invalid admin credentials.');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      let errorMessage = 'An error occurred. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error('Displaying error to user:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Vanta Animated Background */}
      <VantaBackground />
      
      {/* Content with relative positioning */}
      <div className="relative z-10 w-full flex justify-center">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-golden rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>
              Access the FestEats admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@festeats.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="mt-1"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login as Admin'}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Not an admin?{' '}
                <Link to="/student/login" className="text-primary hover:underline">
                  Student Login
                </Link>
              </p>
            </form>

            {/* Demo Credentials */}
            {/* <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">
                <strong>Demo Admin Credentials:</strong>
              </p>
              <p className="text-xs text-gray-600">Email: admin@festeats.com</p>
              <p className="text-xs text-gray-600">Password: admin123</p>
            </div> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
