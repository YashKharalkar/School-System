const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

const validateLogin = [
  body('user_id').trim().notEmpty().withMessage('User ID is required')
    .escape(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation
];

const validateStudent = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ max: 100 }).withMessage('Name must be under 100 characters')
    .escape(),
  body('father_name').optional().trim().isLength({ max: 100 }).escape(),
  body('mother_name').optional().trim().isLength({ max: 100 }).escape(),
  body('dob').optional().isISO8601().withMessage('Invalid date format'),
  body('gender').optional().isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
  body('parent_mobile').optional().trim()
    .matches(/^[0-9]{10}$/).withMessage('Mobile must be 10 digits'),
  body('address').optional().trim().isLength({ max: 500 }).escape(),
  body('class').trim().notEmpty().withMessage('Class is required')
    .escape(),
  body('section').optional().trim().escape(),
  handleValidation
];

const sanitizeQuery = (req, res, next) => {
  for (const key in req.query) {
    if (typeof req.query[key] === 'string') {
      req.query[key] = req.query[key].replace(/[<>"'`;]/g, '');
    }
  }
  next();
};

module.exports = { validateLogin, validateStudent, sanitizeQuery, handleValidation };
