const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://gerald-database:KJtx5kLGZT1kBiZ4@cluster0.kmjer.mongodb.net/myFirstDatabase',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
      }
    );
    console.log('Connected to database');
  } catch (error) {
    if (error) {
      console.log(error);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
