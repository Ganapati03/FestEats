import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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
  createdAt: string;
}

interface BackendMenuItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CartItemBackend {
  foodId: BackendMenuItem;
  quantity: number;
}



interface Scanner {
  id: string;
  image: string;
  isActive: boolean;
  description?: string;
  uploadedBy?: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface AppContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  register: (userData: Omit<User, 'id' | 'role'>) => Promise<boolean>;
  logout: () => void;
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: string, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  orders: Order[];
  placeOrder: (paymentType: 'online' | 'cod', address: string) => Promise<string>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<any>;
  uploadScannerImage: (orderId: string, file: File) => Promise<any>;
  refreshOrders: () => Promise<void>;
  activeScanner: Scanner | null;
  getActiveScanner: () => Promise<void>;
  uploadScanner: (file: File, description?: string) => Promise<any>;
  getAllScanners: () => Promise<Scanner[]>;
  updateScannerStatus: (id: string, isActive: boolean) => Promise<any>;
  deleteScanner: (id: string) => Promise<any>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const mockMenuItems: MenuItem[] = [
  { id: '1', name: 'Burger Deluxe', price: 120, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', category: 'Meals', available: true },
  { id: '2', name: 'Pizza Margherita', price: 200, imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400', category: 'Meals', available: true },
  { id: '3', name: 'French Fries', price: 60, imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', category: 'Snacks', available: true },
  { id: '4', name: 'Samosa', price: 30, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', category: 'Snacks', available: true },
  { id: '5', name: 'Cold Coffee', price: 80, imageUrl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400', category: 'Drinks', available: true },
  { id: '6', name: 'Mango Shake', price: 90, imageUrl: 'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400', category: 'Drinks', available: true },
  { id: '7', name: 'Chicken Biryani', price: 150, imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400', category: 'Meals', available: true },
  { id: '8', name: 'Pav Bhaji', price: 100, imageUrl: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400', category: 'Meals', available: true },
  { id: '9', name: 'Spring Rolls', price: 70, imageUrl: 'https://images.unsplash.com/photo-1619895092538-128341789043?w=400', category: 'Snacks', available: true },
  { id: '10', name: 'Lemonade', price: 50, imageUrl: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f0a?w=400', category: 'Drinks', available: true },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeScanner, setActiveScanner] = useState<Scanner | null>(null);

  // Load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('festEatsUser');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (user) localStorage.setItem('festEatsUser', JSON.stringify(user));
    else localStorage.removeItem('festEatsUser');
  }, [user]);

  // Load menu items from backend
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await axios.get(`${baseURL}/api/food`);
        setMenuItems(response.data.map((item: BackendMenuItem) => ({
          ...item,
          id: item._id,
          imageUrl: item.image,
          available: item.available
        })));
      } catch (error) {
        console.error('Failed to fetch menu items');
        // Fallback to mock data if backend is not available
        setMenuItems(mockMenuItems);
      }
    };
    fetchMenuItems();
  }, []);

  // Load cart and orders from backend when user logs in
  useEffect(() => {
    if (user) {
      const fetchCart = async () => {
        try {
          const token = localStorage.getItem('token');
          const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const response = await axios.get(`${baseURL}/api/cart`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setCart(response.data.items.map((item: CartItemBackend) => ({
            ...item.foodId,
            id: item.foodId._id,
            imageUrl: item.foodId.image,
            quantity: item.quantity
          })));
        } catch (error) {
          console.error('Failed to fetch cart');
        }
      };

      const fetchOrders = async () => {
        try {
          const token = localStorage.getItem('token');
          const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const endpoint = user.role === 'admin' ? `${baseURL}/api/orders` : `${baseURL}/api/orders/my`;
          const response = await axios.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` }
          });
      setOrders(response.data.map((order: any) => ({
        ...order,
        id: order._id,
        studentId: order.userId?._id || order.userId,
        studentName: order.studentName || order.userId?.name || 'Unknown',
        department: order.department,
        class: order.class,
        phone: order.studentPhone || order.userId?.phone || '',
        email: order.studentEmail || order.userId?.email || '',
        address: order.address || '',
        items: order.items.map((item: any) => ({
          ...item.foodId,
          id: item.foodId._id,
          imageUrl: item.foodId.image,
          quantity: item.quantity
        })),
        total: order.totalAmount,
        status: order.deliveryStatus
      })));
        } catch (error) {
          console.error('Failed to fetch orders');
        }
      };

      if (user.role === 'student') {
        fetchCart();
      }
      fetchOrders();
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<User | null> => {
    try {
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log('Login request:', { email, password });
      const response = await axios.post(`${baseURL}/api/auth/login`, { email, password });
      console.log('Login response:', response);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      const userData = { ...user, role: user.isAdmin ? 'admin' : 'student' };
      setUser(userData);
      return userData;
    } catch (error: any) {
      console.error('Login error:', error.response ? error.response.data : error.message);
      return null;
    }
  };

  const register = async (userData: Omit<User, 'id' | 'role'>): Promise<boolean> => {
    try {
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
       console.log('Register request:', userData);
      const response = await axios.post(`${baseURL}/api/auth/register`, userData);
       console.log('Register response:', response);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser({ ...user, role: 'student' });
      return true;
    } catch (error: any) {
      console.error('Registration error:', error.response ? error.response.data : error.message);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setCart([]);
  };

  const addToCart = async (item: MenuItem) => {
    if (!user) {
      console.error('User not logged in');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${baseURL}/api/cart/add`, { foodId: item.id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data.items.map((cartItem: CartItemBackend) => ({
        ...cartItem.foodId,
        id: cartItem.foodId._id,
        imageUrl: cartItem.foodId.image,
        quantity: cartItem.quantity
      })));
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${baseURL}/api/cart/remove`, { foodId: itemId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(response.data.items.map((cartItem: CartItemBackend) => ({
        ...cartItem.foodId,
        id: cartItem.foodId._id,
        imageUrl: cartItem.foodId.image,
        quantity: cartItem.quantity
      })));
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    }
  };

  const updateCartItemQuantity = async (itemId: string, quantity: number) => {
    if (!user) return;
    if (quantity <= 0) {
      await removeFromCart(itemId);
    } else {
      try {
        const token = localStorage.getItem('token');
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await axios.post(`${baseURL}/api/cart/update`, { foodId: itemId, quantity }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCart(response.data.items.map((cartItem: CartItemBackend) => ({
          ...cartItem.foodId,
          id: cartItem.foodId._id,
          imageUrl: cartItem.foodId.image,
          quantity: cartItem.quantity
        })));
      } catch (error) {
        console.error('Failed to update cart quantity:', error);
        throw error;
      }
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.delete(`${baseURL}/api/cart/clear`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart([]);
    } catch (error) {
      console.error('Failed to clear cart');
    }
  };

  const addMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    try {
      const token = localStorage.getItem('token');
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${baseURL}/api/food/add`, item, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newItem = {
        ...response.data.food,
        id: response.data.food._id,
        imageUrl: response.data.food.image,
        available: response.data.food.available
      };
      setMenuItems((prev) => [...prev, newItem]);
    } catch (error) {
      console.error('Failed to add menu item');
      throw error;
    }
  };

  const updateMenuItem = async (id: string, item: Partial<MenuItem>) => {
    try {
      const token = localStorage.getItem('token');
      const updateData: any = { ...item };
      if (item.imageUrl) {
        updateData.image = item.imageUrl;
        delete updateData.imageUrl;
      }
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.put(`${baseURL}/api/food/${id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedItem = {
        ...response.data.food,
        id: response.data.food._id,
        imageUrl: response.data.food.image,
        available: response.data.food.available
      };
      setMenuItems((prev) =>
        prev.map((i) => (i.id === id ? updatedItem : i))
      );
    } catch (error) {
      console.error('Failed to update menu item');
      throw error;
    }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.delete(`${baseURL}/api/food/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMenuItems((prev) => prev.filter((i) => i.id !== id));
    } catch (error) {
      console.error('Failed to delete menu item');
      throw error;
    }
  };

  const placeOrder = async (paymentType: 'online' | 'cod', address: string): Promise<string> => {
    if (!user) throw new Error('Must be logged in');
    if (cart.length === 0) throw new Error('Cart is empty');

    try {
      const token = localStorage.getItem('token');
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${baseURL}/api/orders`, { paymentType, address }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart([]);

      // Refresh orders immediately after placing order to update admin panel
      if (user.role === 'admin') {
        await refreshOrders();
      }

      return response.data.orderId;
    } catch (error) {
      throw new Error('Failed to place order');
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const token = localStorage.getItem('token');
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.put(`${baseURL}/api/orders/${orderId}/status`, { deliveryStatus: status }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update the specific order in the state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );

      return response.data;
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  };

  const uploadScannerImage = async (orderId: string, file: File) => {
    try {
      const token = localStorage.getItem('token');
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const formData = new FormData();
      formData.append('scannerImage', file);

      const response = await axios.post(`${baseURL}/api/orders/${orderId}/scanner`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update the specific order in the state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, scannerImage: response.data.order.scannerImage } : o))
      );

      return response.data;
    } catch (error) {
      console.error('Failed to upload scanner image:', error);
      throw error;
    }
  };

  const getActiveScanner = async () => {
    try {
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${baseURL}/api/scanner/active`);
      setActiveScanner({
        ...response.data,
        id: response.data._id
      });
    } catch (error) {
      console.error('Failed to get active scanner:', error);
      setActiveScanner(null);
    }
  };

  const uploadScanner = async (file: File, description?: string) => {
    try {
      const token = localStorage.getItem('token');
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const formData = new FormData();
      formData.append('scannerImage', file);
      if (description) {
        formData.append('description', description);
      }

      const response = await axios.post(`${baseURL}/api/scanner/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Refresh active scanner
      await getActiveScanner();

      return response.data;
    } catch (error) {
      console.error('Failed to upload scanner:', error);
      throw error;
    }
  };

  const getAllScanners = async (): Promise<Scanner[]> => {
    try {
      const token = localStorage.getItem('token');
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${baseURL}/api/scanner`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.map((scanner: any) => ({
        ...scanner,
        id: scanner._id
      }));
    } catch (error) {
      console.error('Failed to get scanners:', error);
      throw error;
    }
  };

  const updateScannerStatus = async (id: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.put(`${baseURL}/api/scanner/${id}/status`, { isActive }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh active scanner
      await getActiveScanner();

      return response.data;
    } catch (error) {
      console.error('Failed to update scanner status:', error);
      throw error;
    }
  };

  const deleteScanner = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.delete(`${baseURL}/api/scanner/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh active scanner
      await getActiveScanner();

      return response.data;
    } catch (error) {
      console.error('Failed to delete scanner:', error);
      throw error;
    }
  };

  const refreshOrders = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const endpoint = user.role === 'admin' ? `${baseURL}/api/orders` : `${baseURL}/api/orders/my`;
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.map((order: any) => ({
        ...order,
        id: order._id,
        studentId: order.userId?._id || order.userId,
        studentName: order.studentName || order.userId?.name || 'Unknown',
        department: order.department,
        class: order.class,
        phone: order.studentPhone || order.userId?.phone || '',
        email: order.studentEmail || order.userId?.email || '',
        address: order.address || '',
        items: order.items.map((item: any) => ({
          ...item.foodId,
          id: item.foodId._id,
          imageUrl: item.foodId.image,
          quantity: item.quantity
        })),
        total: order.totalAmount,
        status: order.deliveryStatus,
        scannerImage: order.scannerImage
      })));
    } catch (error) {
      console.error('Failed to refresh orders:', error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        register,
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
        uploadScannerImage,
        refreshOrders,
        activeScanner,
        getActiveScanner,
        uploadScanner,
        getAllScanners,
        updateScannerStatus,
        deleteScanner,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
