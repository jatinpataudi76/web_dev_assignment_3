class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;

    if (details && details.length > 0) {
      this.details = details;
    }

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
