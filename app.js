const express = require('express');
require('dotenv').config();

//test database
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGOOSE_URI_LOCAL_TEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    console.log('Connected to database');
  } catch (error) {
    if (error) {
      console.log(error);
      process.exit(1);
    }
  }
};
connectDB();

const app = express();

app.use(express.json({ extended: true }));

app.use('/api/users', require('./route/users'));
app.use('/api/auth', require('./route/auth'));
app.use('/api/updates', require('./route/horizonUpdate'));

app.get('/*', (req, res) => {
  res.status(404).json({ msg: 'Not Found' });
});

module.exports = app;
