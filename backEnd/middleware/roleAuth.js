// Role-based access control middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Not authorized, insufficient permissions',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

module.exports = { authorize };
