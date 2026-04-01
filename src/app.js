const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes.js');
const app = express();

//middlewares
app.use(helmet());
app.use(cors( { origin: process.env.CLIENT_URL, credentials: true } ));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if(process.env.NODE_ENV === 'development'){
  app.use(morgan('dev'));
}

//health check
app.get('/health', (req, res)=>{
  res.send({ status: 'ok', message: 'Server is running' });
});

//routes
app.use ('/api/auth', authRoutes);


// error handler
app.use((err, req, res, next)=>{
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message,
  });
});

module.exports = app;