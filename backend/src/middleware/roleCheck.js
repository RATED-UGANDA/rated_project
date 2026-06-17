function requireRole(...roleNames) {
  return (req, res, next) => {
    if (!req.user || !Array.isArray(req.user.roles)) {
      return res.status(401).json({ error: { message: 'Unauthorized', code: 'NO_USER' } });
    }
    const hasRole = req.user.roles.some((r) => roleNames.includes(r));
    if (!hasRole) {
      return res.status(403).json({ error: { message: 'Forbidden: insufficient role', code: 'FORBIDDEN' } });
    }
    next();
  };
}

module.exports = { requireRole };
