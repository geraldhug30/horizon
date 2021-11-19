const express = require('express');
const auth = require('../middleware/auth');
const HorizonUpdate = require('../model/HorizonUpdates');
const router = express.Router();

// @route   GET /api/updates/allData
// @desc    Get All Horizon Updates Data for testing
// @access  Public

router.get('/allData', async (req, res) => {
  try {
    //check user info in req.user auth
    const update = await HorizonUpdate.find();
    if (!update) {
      return res.status(401).json({ msg: 'No Content Found!' });
    }
    res.status(200).send(update);
  } catch (err) {
    res.status(500).send();
  }
});

// @route   GET /api/updates/:id
// @desc    Get One Horizon Update Data
// @access  Private

router.get('/:id', auth, async (req, res) => {
  const _id = req.params.id;
  try {
    //check user info in req.user auth
    const update = await HorizonUpdate.findOne({
      _id,
      owner: req.user.id,
    });
    if (!update) {
      return res.status(404).json({ msg: 'No Content Found!' });
    }
    return res.status(200).json(update);
  } catch (err) {
    console.log(err);
    return res.status(500).send();
  }
});

// @route   POST /api/updates
// @desc    Create an Horizon Update Data
// @access  Private

router.post('/', auth, (req, res) => {
  const update = new HorizonUpdate({
    ...req.body,
    owner: req.user.id,
  });
  try {
    update.save();
    res.status(201).send(update);
  } catch (err) {
    res.status(500).send(err);
  }
});

// @route   PATCH /api/updates/:id
// @desc    Update the Horizon Update Data
// @access  Private

router.patch('/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['updateBody'];
  const isValidUpdates = updates.every((items) =>
    allowedUpdates.includes(items)
  );
  if (!isValidUpdates) {
    return res.status(400).send({ error: 'error updates' });
  }

  try {
    const horizonUpdate = await HorizonUpdate.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });
    if (!horizonUpdate) {
      return res.status(500).send('error');
    }

    updates.forEach((up) => (horizonUpdate[up] = req.body[updates]));

    horizonUpdate.posted = false;

    await horizonUpdate.save();

    res.status(200).send(horizonUpdate);
  } catch (error) {
    return res.status(400).send(error);
  }
});

// @route   DELETE /api/updates/:id
// @desc    Delete an Horizon Update Data
// @access  Private

router.delete('/:id', auth, async (req, res) => {
  try {
    const update = await HorizonUpdate.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });
    if (!update) {
      return res.status(401).send();
    }
    res.status(200).send(update);
  } catch (err) {
    res.status(500).send('error' + err);
  }
});

module.exports = router;
