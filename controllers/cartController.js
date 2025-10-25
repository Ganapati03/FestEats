const Cart = require('../models/Cart');
const Food = require('../models/Food');

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user }).populate('items.foodId');
    if (!cart) {
      return res.json({ items: [] });
    }
    res.json({ items: cart.items });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { foodId, quantity = 1 } = req.body;
    const food = await Food.findById(foodId);
    if (!food || !food.available) {
      return res.status(400).json({ message: 'Food not available' });
    }
    let cart = await Cart.findOne({ userId: req.user });
    if (!cart) {
      cart = new Cart({ userId: req.user, items: [] });
    }
    const existingItem = cart.items.find(item => item.foodId.toString() === foodId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ foodId, quantity });
    }
    await cart.save();
    await cart.populate('items.foodId');
    res.json({ items: cart.items });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { foodId } = req.body;
    const cart = await Cart.findOne({ userId: req.user });
    if (!cart) {
      return res.status(400).json({ message: 'Cart not found' });
    }
    cart.items = cart.items.filter(item => item.foodId.toString() !== foodId);
    await cart.save();
    await cart.populate('items.foodId');
    res.json({ items: cart.items });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const { foodId, quantity } = req.body;
    if (quantity <= 0) {
      return exports.removeFromCart(req, res);
    }
    const cart = await Cart.findOne({ userId: req.user });
    if (!cart) {
      return res.status(400).json({ message: 'Cart not found' });
    }
    const item = cart.items.find(item => item.foodId.toString() === foodId);
    if (!item) {
      return res.status(400).json({ message: 'Item not in cart' });
    }
    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.foodId');
    res.json({ items: cart.items });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user });
    res.json({ items: [] });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
