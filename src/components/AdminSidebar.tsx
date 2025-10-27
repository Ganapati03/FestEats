import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, Users, LogOut, Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';

type AdminSidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

export function AdminSidebar({}: AdminSidebarProps = {}) {
  const location = useLocation();
  const { logout } = useApp();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
    { icon: UtensilsCrossed, label: 'Menu Items', path: '/admin/menu' },
    { icon: Users, label: 'Students', path: '/admin/students' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Menu className="w-5 h-5 text-gray-400" />
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xl">🍔</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 text-lg">FestEats</h2>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors duration-200
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-primary/10 to-secondary/10 text-primary font-medium'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 h-11 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
}
