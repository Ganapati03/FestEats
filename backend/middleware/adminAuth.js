const adminAuth = async (req, res, next) => {
  try {
    if (!req.userObj || !req.userObj.isAdmin) {
      throw new Error('Access denied. Admin only.');
    }
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = adminAuth;