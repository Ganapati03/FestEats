const Order = require('../models/Order');
const User = require('../models/User');
const Food = require('../models/Food');
const Cart = require('../models/Cart');

exports.createOrder = async (req, res) => {
  try {
    const { paymentType, address } = req.body;
    const userId = req.user; // From JWT middleware (user ID)

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is admin - admins cannot place orders
    if (user.isAdmin) {
      return res.status(403).json({ message: 'Admins cannot place orders' });
    }

    // Get cart
    const cart = await Cart.findOne({ userId }).populate('items.foodId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total amount
    let totalAmount = 0;
    const populatedItems = [];
    for (const item of cart.items) {
      const food = item.foodId;
      if (!food.available) {
        return res.status(400).json({ message: `Food item ${food.name} not available` });
      }
      totalAmount += food.price * item.quantity;
      populatedItems.push({ foodId: item.foodId._id, quantity: item.quantity });
    }

    // Set payment status based on type
    let paymentStatus = 'pending';
    if (paymentType === 'online') {
      paymentStatus = 'pending_verification';
    } else if (paymentType === 'cod') {
      paymentStatus = 'pending';
    }

    // Create order
    const order = new Order({
      userId,
      studentName: user.name,
      studentEmail: user.email,
      studentPhone: user.phone,
      items: populatedItems,
      totalAmount,
      paymentType,
      paymentStatus,
      department: user.department,
      class: user.class,
      address
    });

    await order.save();

    // Clear cart
    await Cart.findOneAndDelete({ userId });

    res.status(201).json({ message: 'Order placed successfully', orderId: order._id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user;
    const orders = await Order.find({ userId })
      .populate('items.foodId', 'name price image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { department, class: userClass, paymentType } = req.query;
    let filter = {};

    if (department) filter.department = department;
    if (userClass) filter.class = userClass;
    if (paymentType) filter.paymentType = paymentType;

    const orders = await Order.find(filter)
      .populate({
        path: 'userId',
        select: 'name email department class phone',
        model: 'User'
      })
      .populate({
        path: 'items.foodId',
        select: 'name price image',
        model: 'Food'
      })
      .sort({ createdAt: -1 });

    // Transform orders to include student details from order or user
    const transformedOrders = orders.map(order => ({
      ...order.toObject(),
      studentName: order.studentName || order.userId?.name || 'Unknown',
      studentEmail: order.studentEmail || order.userId?.email || '',
      studentPhone: order.studentPhone || order.userId?.phone || '',
    }));

    res.json(transformedOrders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryStatus } = req.body;

    const order = await Order.findByIdAndUpdate(id, { deliveryStatus }, { new: true })
      .populate('userId', 'name email phone');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;

    const order = await Order.findByIdAndUpdate(id, { paymentStatus }, { new: true })
      .populate('userId', 'name email phone');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Payment status updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
