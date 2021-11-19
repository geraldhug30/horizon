const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/Users');
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

// @route   GET api/auth
// @desc    Get login user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ msg: 'Server error!' });
  }
});

// @route   POST api/auth
// @desc    Auth/Login user and get token
// @access  Public
router.post(
  '/',
  [
    check('email')
      .isEmail()
      .withMessage('Input Email is required!')
      .normalizeEmail(),
    check('password')
      .notEmpty()
      .withMessage('Please insert a password!')
      .isLength({ min: 5 })
      .withMessage('Password must be 5 character or more!')
      .trim()
      .escape(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ msg: errors });
    }

    const { email, password } = req.body;
    try {
      // find user
      const user = await User.findOne({ email });

      if (user === null)
        return res.status(400).json({ msg: 'Invalid Credential' });

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) return res.status(400).json({ msg: 'Invalid Credential' });

      const payload = {
        user: {
          id: user.id,
          firstName: user.firstName,
          position: user.position,
        },
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          return res.status(200).json({ token });
        }
      );
    } catch (error) {
      return res.status(500).json({ msg: 'Server error!' });
    }
  }
);

module.exports = router;
