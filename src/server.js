require('dotenv').config(); // must be first — loads .env before anything else

const app = require('./app');
const connectDB = require('./config/db');
const redis = require('./config/redis'); // importing triggers the connection

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // wait for MongoDB before accepting requests
  await connectDB() 
  .then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
  })
  .catch((err) => {
    console.log(`MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  });
};

startServer();