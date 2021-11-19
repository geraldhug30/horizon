const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sharp = require('sharp');
const multer = require('multer');
const { check, param, validationResult } = require('express-validator');
// const { sendWelcomeEmail } = require('../email/email');
const User = require('../model/Users');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET api/users/allData
// @desc    Get All User Data
// @access  Public

router.get('/allData', async (req, res) => {
  try {
    const user = await User.find();
    if (!user) res.status(404);

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ msg: 'Something went wrong :(' });
  }
});

// @route   GET api/users
// @desc    Email Verify
// @access  Public

router.get('/:id', [param('id').notEmpty().trim()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ msg: errors });
  }

  try {
    let user = await User.findByIdAndUpdate(
      { _id: req.params.id },
      {
        isVerifiedEmail: true,
      }
    );
    if (!user) {
      return res.status(401).json({ msg: 'Not authorized!' });
    }

    return res.status(200).json({ msg: 'Email Verified!' });
  } catch (error) {
    return res.status(500).json({ msg: 'Something went wrong :(' });
  }
});

// @route   POST api/users
// @desc    Register a user
// @access  Public

router.post(
  '/',
  [
    // check fname
    check('firstName', 'First name is required')
      .not()
      .isEmpty()
      .trim()
      .escape(),
    // check lname
    check('lastName', 'Last Name is required').not().isEmpty().trim().escape(),
    // username must be an email
    check('email', 'Please insert a valid email address')
      .isEmail()
      .notEmpty()
      .normalizeEmail(),
    // position
    check('position', 'Please provide your company position').notEmpty(),
    // password must be at least 5 chars long
    check('password')
      .trim()
      .escape()
      .isLength({ min: 5 })
      .withMessage('Password must be at least 5 chars long')
      .matches(/\d/)
      .withMessage('Password must contain a number')
      .notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ msg: errors });
    }
    const { firstName, lastName, email, position, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(401).json({ msg: 'Account is already registered!' });
      }

      user = new User({
        firstName,
        lastName,
        email,
        position,
        password,
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      //  sendWelcomeEmail(email, { name: user.firstName, id: user._id })

      const payload = {
        user: {
          id: user.id,
          name: user.name,
          position: user.position,
        },
      };
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          return res.status(200).json({ token, user });
        }
      );
    } catch (error) {
      // if (error) console.log(error)
      return res.status(500).json({ msg: 'Server Error' });
    }
  }
);

// multer config file, desitination and validate
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload an image'));
    }
    cb(undefined, true);
  },
});

// @route   PATCH /api/users
// @desc    Edit user
// @access  Private

router.patch('/', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['firstName', 'lastName', 'email', 'password'];
  const isValidUpdates = updates.every((items) =>
    allowedUpdates.includes(items)
  );
  if (!isValidUpdates) {
    return res.status(400).send({ error: 'error updates' });
  }
  try {
    const users = await User.findOne({
      _id: req.user.id,
    });
    if (!users) {
      throw Error;
    }
    updates.forEach((update) => (users[update] = req.body[update]));
    // if want to change password
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      users.password = await bcrypt.hash(req.body.password, salt);
    }
    await users.save();
    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: 'Something went wrong!' });
  }
});

// @route   POST api/users/avatar
// @desc    Upload image or update
// @access  Private

router.post(
  '/avatar',
  auth,
  upload.single('upload'),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .webp({ lossless: true, quality: 60 })
      .resize(100)
      .toFormat('png')
      .toBuffer();

    try {
      const user = await User.findByIdAndUpdate(
        { _id: req.user.id },
        {
          avatar: buffer,
        }
      );
      if (user === null) {
        throw Error;
      }
      return res.status(200).json({ user });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ msg: 'Failed to upload' });
    }
  },
  (error, req, res) => {
    res.status(400).send({ error: error.message });
  }
);

// @route   DELETE api/users/delete
// @desc    Delete image or update
// @access  Private

router.delete('/delete', auth, async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.user.id });
    // sendGoodbyeEmail(req.user.email, req.user.name)
    res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ msg: 'Failed to delete' });
  }
});

module.exports = router;
