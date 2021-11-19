const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../../model/Users');
const HorizonUpdates = require('../../model/HorizonUpdates');

const dummyTest1Id = new mongoose.Types.ObjectId();
const dummyTest1 = {
  _id: dummyTest1Id,
  firstName: 'gerald',
  lastName: 'hug',
  email: 'gerald_hug92@gmail.com',
  position: 'Admin',
  password: '123456',
};

const dummyTest2 = {
  _id: '5ea391e31eef6708fc396da4',
  firstName: 'rion',
  lastName: 'hug',
  email: 'rion92@gmail.com',
  position: 'Reviewer',
  password: '123456',
};

const dummyTestHUpdateId = new mongoose.Types.ObjectId();
const dummyTestHUpdate = {
  _id: dummyTestHUpdateId,
  owner: '5ea391e31eef6708fc396da4',
  updateBody: 'this is sample 123',
};

const setupDB = async () => {
  await User.deleteMany();
  const salt = await bcrypt.genSalt(10);
  dummyTest1.password = await bcrypt.hash('123456', salt);
  dummyTest2.password = await bcrypt.hash('123456', salt);
  await new User(dummyTest1).save();
  await new User(dummyTest2).save();
  await HorizonUpdates.deleteMany();
  await new HorizonUpdates(dummyTestHUpdate).save();
};

module.exports = {
  dummyTest1Id,
  dummyTest1,
  dummyTest2,
  dummyTestHUpdateId,
  setupDB,
};
