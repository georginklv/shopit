const app = require('./app');
const connectDatabase = require('./config/database')

const dotenv = require('dotenv');

// Handle Uncaught exception
process.on('uncaughtException', err => {
  console.log(`ERROR: ${err.stack}`);
  console.log(`Shutting down the serve due to Uncaught exception`);
  process.exit(1);
})

// Setting up config file
dotenv.config({ path: 'backend/config/config.env' })


// Conneting to DB
connectDatabase();

const server = app.listen(process.env.PORT, () => {
  console.log(`Sever started on PORT : ${process.env.PORT} in ${process.env.NODE_ENV} mode`);
})

// Handle Unhandled promise reject

process.on('unhandledRejection', err => {
  console.log(`ERROR : ${err.message}`);
  console.log(`Shutting down the serve due to Unhandled promise rejection`);
  server.close(() => {
    process.exit(1);
  })
})