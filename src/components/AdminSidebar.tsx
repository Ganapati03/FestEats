import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';

export function AdminSidebar() {
  const location = useLocation();
  const { logout } = useApp();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/menu', icon: UtensilsCrossed, label: 'Menu' },
    { path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  ];

  return (
    <div className="w-64 bg-white border-r min-h-[calc(100vh-64px)] flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-gray-800">Admin Panel</h2>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
