function validateBody(rules) {
  return (req, res, next) => {
    const errors = [];
    for (const [field, rule] of Object.entries(rules)) {
      const value = req.body[field];
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
      }
      if (rule.minLength && value && value.length < rule.minLength) {
        errors.push(`${field} must be at least ${rule.minLength} characters`);
      }
      if (rule.email && value && !/^\S+@\S+\.\S+$/.test(value)) {
        errors.push(`${field} must be a valid email`);
      }
    }
    if (errors.length > 0) {
      const err = new Error(errors.join('; '));
      err.status = 400;
      err.code = 'VALIDATION_ERROR';
      return next(err);
    }
    next();
  };
}

module.exports = { validateBody };
