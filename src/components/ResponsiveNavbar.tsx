import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, LogOut, User, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { useApp } from '../context/AppContext';
import { useState, useEffect } from 'react';

export function ResponsiveNavbar() {
  const { user, logout, cart } = useApp();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const navLinks = user?.role === 'student' ? (
    <>
      <NavLink to="/" isActive={isActive('/')}>Home</NavLink>
      <NavLink to="/menu" isActive={isActive('/menu')}>Menu</NavLink>
      <NavLink to="/orders" isActive={isActive('/orders')}>Orders</NavLink>
    </>
  ) : user?.role === 'admin' ? null : (
    <>
      <NavLink to="/" isActive={isActive('/')}>Home</NavLink>
      <NavLink to="/menu" isActive={isActive('/menu')}>Menu</NavLink>
      <NavLink to="/student/login" isActive={isActive('/student/login')}>Login</NavLink>
    </>
  );

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b">
      <div className="container-fluid">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Logo - responsive sizing */}
          <Link to="/" className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-xl md:text-2xl" role="img" aria-label="burger">🍔</span>
            </div>
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
              FestEats
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {user.role === 'student' && (
                  <Link to="/cart">
                    <Button variant="outline" size="sm" className="relative">
                      <ShoppingCart className="w-4 h-4" />
                      {cartItemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                          {cartItemCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                )}
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/student/login">
                <Button>Login</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button - touch-friendly */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-12 h-12 flex items-center justify-center rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - full-screen overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="md:hidden fixed inset-y-0 right-0 w-full max-w-sm bg-white z-50 shadow-2xl overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Mobile Navigation Links */}
              <div className="flex flex-col gap-2">
                {navLinks}
              </div>

              {/* Mobile Actions */}
              <div className="pt-6 border-t space-y-4">
                {user ? (
                  <>
                    {user.role === 'student' && (
                      <Link
                        to="/cart"
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <ShoppingCart className="w-5 h-5 text-orange-500" />
                          <span className="font-medium">Cart</span>
                        </div>
                        {cartItemCount > 0 && (
                          <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                            {cartItemCount}
                          </span>
                        )}
                      </Link>
                    )}
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <Button variant="outline" className="w-full" onClick={logout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Link to="/student/login" className="w-full">
                    <Button className="w-full">Login</Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}

// Reusable NavLink component
function NavLink({ to, isActive, children }: { to: string; isActive: boolean; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className={`
        px-4 py-2 rounded-lg font-medium transition-all duration-200
        hover:bg-gray-100 active:bg-gray-200
        ${isActive ? 'text-orange-500 bg-orange-50' : 'text-gray-700'}
        focus-visible:ring-2 focus-visible:ring-orange-500
      `}
    >
      {children}
    </Link>
  );
}
