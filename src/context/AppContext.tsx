import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  class: string;
  role: 'student' | 'admin';
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  available: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface Order {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  class: string;
  phone: string;
  email: string;
  address: string;
  items: CartItem[];
  total: number;
  paymentType: 'online' | 'cod';
  status: 'pending' | 'preparing' | 'delivered';
  scannerImage?: string;
  createdAt?: string;
}

interface AppContextType {
  user: User | null;
  login: (email: string, password: string, role?: 'student' | 'admin') => Promise<User>;
  register: (userData: Omit<User, 'id' | 'role'>) => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  logout: () => void;
  cart: CartItem[];
  addToCart: (item: MenuItem) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateCartItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => Promise<MenuItem>;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  orders: Order[];
  placeOrder: (paymentType: 'online' | 'cod', address: string) => Promise<string>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  refreshOrders: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

// Helper function for retry logic
const fetchWithRetry = async (url: string, options: any = {}, retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios(url, options);
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      
      if (axios.isAxiosError(error) && error.code === 'ERR_NETWORK') {
        console.log(`Retry ${i + 1}/${retries} - Waiting for backend to wake up...`);
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries reached');
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('festEatsUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('festEatsUser');
      }
    }
  }, []);

  // Load menu items from backend
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        console.log('Fetching menu items from:', `${API_BASE}/api/food`);
        toast.info('Loading menu items...', { duration: 2000 });
        
        const response = await fetchWithRetry(`${API_BASE}/api/food`, { method: 'GET' });
        
        if (response) {
          console.log('Raw menu items from backend:', response.data);
          
          const items = response.data.map((item: any) => ({
            id: item._id,
            name: item.name,
            price: item.price,
            imageUrl: item.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
            category: item.category,
            available: item.available ?? true,
          }));
          
          setMenuItems(items);
          toast.success('Menu items loaded successfully!', { duration: 2000 });
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('Menu fetch error details:', {
            message: error.message,
            code: error.code,
            status: error.response?.status,
          });
          
          if (error.code === 'ERR_NETWORK' || !error.response) {
            toast.error(
              'Cannot connect to server. Menu items unavailable.',
              {
                description: 'Please check your internet connection or try again later.',
                duration: 5000,
              }
            );
          }
        }
        setMenuItems([]);
      }
    };
    fetchMenuItems();
  }, []);

  // Load cart and orders when user logs in
  useEffect(() => {
    if (user) {
      if (user.role === 'student') {
        fetchCart();
      }
      fetchOrders();
    } else {
      setCart([]);
      setOrders([]);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get(`${API_BASE}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const cartItems = (response.data.items || []).map((item: any) => ({
        id: item.foodId?._id || item.foodId,
        name: item.foodId?.name || 'Unknown Item',
        price: item.foodId?.price || 0,
        imageUrl: item.foodId?.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
        category: item.foodId?.category || 'Other',
        available: item.foodId?.available ?? true,
        quantity: item.quantity || 1,
      }));
      
      setCart(cartItems);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setCart([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) return;

      const endpoint = user.role === 'admin' 
        ? `${API_BASE}/api/orders` 
        : `${API_BASE}/api/orders/my`;
      
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const ordersList = (response.data || []).map((order: any) => ({
        id: order._id,
        studentId: order.userId?._id || order.userId || 'unknown',
        studentName: order.studentName || order.userId?.name || 'Unknown',
        department: order.department || 'N/A',
        class: order.class || 'N/A',
        phone: order.studentPhone || order.userId?.phone || '',
        email: order.studentEmail || order.userId?.email || '',
        address: order.address || '',
        items: (order.items || []).map((item: any) => ({
          id: item.foodId?._id || item.id || 'unknown',
          name: item.foodId?.name || item.name || 'Unknown Item',
          price: item.foodId?.price || item.price || 0,
          imageUrl: item.foodId?.image || item.imageUrl || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
          category: item.foodId?.category || 'Other',
          available: true,
          quantity: item.quantity || 1,
        })),
        total: order.totalAmount || 0,
        status: order.deliveryStatus || 'pending',
        paymentType: order.paymentType || 'cod',
        scannerImage: order.scannerImage,
        createdAt: order.createdAt,
      }));

      setOrders(ordersList);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
    }
  };

  const login = async (email: string, password: string, role: 'student' | 'admin' = 'student'): Promise<User> => {
    try {
      console.log('Attempting login:', { email, role, apiBase: API_BASE });
      
      const loginUrl = `${API_BASE}/api/auth/login`;
      console.log('POST request to:', loginUrl);
      
      const response = await axios.post(loginUrl, {
        email,
        password,
      });

      console.log('Full login response:', response.data);

      let token: string = '';
      let userData: any = null;
      
      if (response.data.token && response.data.user) {
        token = response.data.token;
        userData = response.data.user;
      } else if (response.data.accessToken && response.data.user) {
        token = response.data.accessToken;
        userData = response.data.user;
      } else if (response.data.data) {
        token = response.data.data.token || response.data.data.accessToken;
        userData = response.data.data.user || response.data.data;
      } else if (response.data.id) {
        userData = response.data;
        token = response.data.token || response.data.accessToken || `temp-${Date.now()}`;
      }

      if (!userData) {
        throw new Error('No user data received from server');
      }

      const normalizedUser: User = {
        id: userData._id || userData.id || '',
        name: userData.name || userData.username || '',
        email: userData.email || '',
        phone: userData.phone || '',
        department: userData.department || '',
        class: userData.class || userData.year || '',
        role: userData.role || (userData.isAdmin ? 'admin' : 'student'),
      };

      if (role === 'student' && normalizedUser.role !== 'student') {
        throw new Error('This account is not a student account. Please use Admin Login.');
      }
      
      if (role === 'admin' && normalizedUser.role !== 'admin') {
        throw new Error('This account is not an admin account. Please use Student Login.');
      }

      localStorage.setItem('token', token);
      if (normalizedUser.role === 'admin') {
        localStorage.setItem('adminToken', token);
      }
      localStorage.setItem('user', JSON.stringify(normalizedUser));
      localStorage.setItem('festEatsUser', JSON.stringify(normalizedUser));
      
      setUser(normalizedUser);
      return normalizedUser;
    } catch (error) {
      console.error('Login error:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ERR_NETWORK') {
          throw new Error(
            '🔴 Cannot connect to server.\n\n' +
            'Possible causes:\n' +
            '• Backend is not running or sleeping (Render free tier)\n' +
            '• CORS is not configured on backend\n' +
            '• Network/Internet connection issue\n\n' +
            'Please wait 30-60 seconds for Render to wake up the backend.'
          );
        }
        
        if (error.response?.status === 0) {
          throw new Error('Network error. Please check if backend is accessible.');
        }
        
        const message = error.response?.data?.message || 
                       error.response?.data?.error ||
                       'Login failed. Please check your credentials.';
        throw new Error(message);
      }
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Network error. Please check your connection.');
    }
  };

  const register = async (userData: Omit<User, 'id' | 'role'>): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_BASE}/api/auth/register`, {
        ...userData,
        role: 'student'
      });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('festEatsUser', JSON.stringify(user));
      setUser({ ...user, role: 'student' });
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !user) {
        throw new Error('Not authenticated');
      }

      const response = await axios.put(`${API_BASE}/api/auth/profile`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedUser = { ...user, ...response.data.user };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('festEatsUser', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('user');
    localStorage.removeItem('festEatsUser');
    setUser(null);
    setCart([]);
    setOrders([]);
  };

  const addToCart = async (item: MenuItem): Promise<void> => {
    if (!user) {
      throw new Error('User not logged in');
    }
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      await axios.post(`${API_BASE}/api/cart/add`, 
        { foodId: item.id }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchCart();
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: string): Promise<void> => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/api/cart/remove`, 
        { foodId: itemId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchCart();
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    }
  };

  const updateCartItemQuantity = async (itemId: string, quantity: number): Promise<void> => {
    if (!user) return;
    
    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_BASE}/api/cart/update`, 
        { foodId: itemId, quantity }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchCart();
    } catch (error) {
      console.error('Failed to update cart quantity:', error);
      throw error;
    }
  };

  const clearCart = async (): Promise<void> => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE}/api/cart/clear`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCart([]);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  const addMenuItem = async (item: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('Authentication required');
      }

      const payload = {
        name: item.name,
        price: Number(item.price),
        image: item.imageUrl,
        category: item.category,
        available: Boolean(item.available),
      };

      const response = await axios.post(`${API_BASE}/api/food/add`, payload, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const foodData = response.data.food || response.data;
      const newItem: MenuItem = {
        id: foodData._id || foodData.id,
        name: foodData.name,
        price: Number(foodData.price),
        imageUrl: foodData.image || item.imageUrl,
        category: foodData.category,
        available: foodData.available ?? true,
      };

      setMenuItems(prev => [...prev, newItem]);
      return newItem;
    } catch (error) {
      console.error('Failed to add menu item:', error);
      throw error;
    }
  };

  const updateMenuItem = async (id: string, item: Partial<MenuItem>): Promise<void> => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const updateData: any = { ...item };
      if (item.imageUrl) {
        updateData.image = item.imageUrl;
        delete updateData.imageUrl;
      }

      const response = await axios.put(`${API_BASE}/api/food/${id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const updatedItem = {
        id: response.data.food._id,
        name: response.data.food.name,
        price: response.data.food.price,
        imageUrl: response.data.food.image,
        category: response.data.food.category,
        available: response.data.food.available
      };

      setMenuItems(prev => prev.map(i => i.id === id ? updatedItem : i));
    } catch (error) {
      console.error('Failed to update menu item:', error);
      throw error;
    }
  };

  const deleteMenuItem = async (id: string): Promise<void> => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      await axios.delete(`${API_BASE}/api/food/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMenuItems(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error('Failed to delete menu item:', error);
      throw error;
    }
  };

  const placeOrder = async (paymentType: 'online' | 'cod', address: string): Promise<string> => {
    if (!user) throw new Error('Must be logged in');
    if (cart.length === 0) throw new Error('Cart is empty');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE}/api/orders`, 
        { paymentType, address }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await clearCart();
      await fetchOrders();

      return response.data.orderId || response.data._id;
    } catch (error) {
      console.error('Failed to place order:', error);
      throw new Error('Failed to place order');
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<void> => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      await axios.put(`${API_BASE}/api/orders/${orderId}/status`, 
        { deliveryStatus: status }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  };

  const refreshOrders = async (): Promise<void> => {
    await fetchOrders();
  };

  const value: AppContextType = {
    user,
    login,
    register,
    updateProfile,
    logout,
    cart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    orders,
    placeOrder,
    updateOrderStatus,
    refreshOrders,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
