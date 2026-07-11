const roleCheck = (...roles) => {
  return (req, res, next) => {
    console.log('[roleCheck Debug] Allowed roles:', roles);
    console.log('[roleCheck Debug] Request user:', req.user);
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      console.log('[roleCheck Debug] Role mismatch! Denying access.');
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

module.exports = roleCheck;
