const errorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || error.status || 500;
  let message = error.message || 'Internal server error';
  let details = error.details;

  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(error.errors).map((item) => item.message);
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${error.path}`;
  } else if (error.code === 11000) {
    statusCode = 409;
    const field = Object.keys(error.keyValue || {})[0] || 'field';
    message = `A product with this ${field} already exists`;
  } else if (error.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }

  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'Internal server error';
  }

  const response = {
    success: false,
    message,
  };

  if (details && details.length > 0) {
    response.errors = details;
  }

  if (process.env.NODE_ENV !== 'production' && statusCode >= 500) {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = { errorHandler, notFound };
