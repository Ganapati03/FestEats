module.exports = (req, res, next) => {
  if (!req.userObj || !req.userObj.isAdmin) {
    return res.status(403).json({ message: 'Access denied, admin only' });
  }
  next();
};
