import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Toaster } from './components/ui/sonner';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Cart } from './pages/Cart';
import { VoiceChatbot } from './components/VoiceChatbot';

// Pages
import { LandingPage } from './pages/LandingPage';
import { StudentRegister } from './pages/StudentRegister';
import { StudentLogin } from './pages/StudentLogin';
import { MenuPage } from './pages/MenuPage';
import { OrderStatus } from './pages/OrderStatus';
import { MyOrders } from './pages/MyOrders';
import { Profile } from './pages/Profile';

import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminMenu } from './pages/AdminMenu';
import { AdminOrders } from './pages/AdminOrders';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/menu" element={<MenuPage />} />

              {/* Student Routes */}
              <Route path="/student/register" element={<StudentRegister />} />
              <Route path="/student/login" element={<StudentLogin />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/order-status/:orderId" element={<OrderStatus />} />
              <Route path="/orders" element={<MyOrders />} />
              <Route path="/profile" element={<Profile />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/menu" element={<AdminMenu />} />
              <Route path="/admin/orders" element={<AdminOrders />} />

              {/* Catch-all route - redirects to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-center" richColors />
          <VoiceChatbot />
        </div>
      </Router>
    </AppProvider>
  );
}
