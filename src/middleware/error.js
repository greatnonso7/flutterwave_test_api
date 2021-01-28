const ErrorResponse = require("../utils/errorResponse")

const errorHandler = (err, req, res, next) => {
  let error = { ...err }

  error.message = err.message

  /** Log to console for the dev */
  console.log(`
-------------------------------  
${err}
_______________________________
  `);

  if (err.type && err.type === 'entity.parse.failed') {
    return res.status(400).json({ status: 'error', message: 'Invalid JSON payload passed.', data: null });
  }

  res.status(error.statusCode || 500).json({ status: 'error', message: error.message || 'Server error', data: null })
}

module.exports = errorHandler