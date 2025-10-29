import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, LogOut, User, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { useApp } from '../context/AppContext';
import { useState } from 'react';

export function Navbar() {
  const { user, logout, cart } = useApp();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const cartItemCount = cart.reduce((sum: number, item) => sum + item.quantity, 0);

  const navLinks = user?.role === 'student' ? (
    <>
      <Link
        to="/"
        className={`transition-colors hover:text-primary ${
          isActive('/') ? 'text-primary' : ''
        }`}
      >
        Home
      </Link>
      <Link
        to="/menu"
        className={`transition-colors hover:text-primary ${
          isActive('/menu') ? 'text-primary' : ''
        }`}
      >
        Menu
      </Link>
      <Link
        to="/orders"
        className={`transition-colors hover:text-primary ${
          isActive('/orders') ? 'text-primary' : ''
        }`}
      >
        Orders
      </Link>
    </>
  ) : user?.role === 'admin' ? null : (
    <>
      <Link
        to="/"
        className={`transition-colors hover:text-primary ${
          isActive('/') ? 'text-primary' : ''
        }`}
      >
        Home
      </Link>
      <Link
        to="/menu"
        className={`transition-colors hover:text-primary ${
          isActive('/menu') ? 'text-primary' : ''
        }`}
      >
        Menu
      </Link>
      <Link
        to="/student/login"
        className={`transition-colors hover:text-primary ${
          isActive('/student/login') ? 'text-primary' : ''
        }`}
      >
        Login
      </Link>
    </>
  );

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 w-full max-[430px]:w-[100vw]">
      <div className="mx-auto w-full max-[430px]:w-[100vw] px-0 md:px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <span className="text-white">🍔</span>
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              FestEats
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
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
                        <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                          {cartItemCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                )}
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm">{user.name}</span>
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

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="flex flex-col gap-4">
              {navLinks}
              {user ? (
                <>
                  {user.role === 'student' && (
                    <Link
                      to="/cart"
                      className="flex items-center gap-2 text-gray-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Cart ({cartItemCount})
                    </Link>
                  )}
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">{user.name}</span>
                  </div>
                  <Button variant="outline" onClick={logout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <Link to="/student/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Login</Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
