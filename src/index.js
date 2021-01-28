const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const ErrorHandler = require('./middleware/error');

const app = express();


dotenv.config({ path: __dirname + '/config/config.env' })

const base = require("./routes/route");

/** Body parser */
app.use(express.json())

/**
 * Development logging middleware
 */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use('/', base)

// catch 404 and forwarding to error handler
app.use(function (req, res) {
  return res.status(404).json({ error: 'Route not found' });
});

app.use(ErrorHandler)

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} on port ${process.env.PORT}`)
})

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`)

  /* Close Server and exit process */
  server.close(() => process.exit(1))
})