const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

// Database
const connectDB = require('./config/db');
connectDB();
// Express Utils
const app = express();
app.use(express.json({ extended: true }));

// middleware
app.use(helmet());
app.use(cors());
app.use(morgan('tiny'));

app.use('/api/users', require('./route/users'));
app.use('/api/auth', require('./route/auth'));
app.use('/api/updates', require('./route/horizonUpdate'));

app.get('/*', (req, res) => {
  res.status(200).json({ msg: 'Not Found' });
});

// app.get('/*', (req, res) => {
//   res.status(404).json({ msg: 'Route Not Found' });
// });

const port = process.env.PORT;
const path = require('path');

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  );
}

app.listen(port, (err) => {
  if (err) console.log(err);
  console.log(`Server is running on port: ${port}`);
});
