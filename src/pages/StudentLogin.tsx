import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useApp } from '../context/AppContext';
import { VantaBackground } from '../components/VantaBackground';
import { toast } from 'sonner';
import { User } from 'lucide-react';

export function StudentLogin() {
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
      const user = await login(formData.email, formData.password);
      if (user && user.role === 'student') {
        toast.success('Student login successful!');
        navigate('/menu');
      } else {
        toast.error('Invalid student credentials. Please try again.');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Vanta Animated Background */}
      <VantaBackground />
      
      {/* Content with relative positioning */}
      <div className="relative z-10 w-full flex justify-center">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-golden rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <CardTitle>Student Login</CardTitle>
            <CardDescription>
              Login to order your favorite food
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@student.college.edu"
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
                {loading ? 'Logging in...' : 'Login'}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/student/register" className="text-primary hover:underline">
                    Register here
                  </Link>
                </p>
                <p className="text-sm text-gray-600">
                  Are you an admin?{' '}
                  <Link to="/admin/login" className="text-secondary hover:underline">
                    Admin Login
                  </Link>
                </p>
              </div>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800 mb-2">
                <strong>Demo:</strong> Use any email/password for student login
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
