/**
 * Centralized Error Handler Middleware
 *
 * Catches all unhandled errors thrown or passed via next(error)
 * and returns a consistent JSON error response.
 */
const errorHandler = (err, req, res, next) => {
  // Log the full error stack in development for debugging
  console.error(`[Error] ${err.message}`);
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  // Default status code and message
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Handle specific Mongoose errors with user-friendly messages
  // Duplicate key error (e.g., wallet address already exists)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue).join(", ");
    message = `Duplicate value for field: ${field}. This resource already exists.`;
  }

  // Mongoose validation error (e.g., missing required field)
  if (err.name === "ValidationError") {
    statusCode = 400;
    const errors = Object.values(err.errors).map((val) => val.message);
    message = `Validation failed: ${errors.join(". ")}`;
  }

  // Mongoose bad ObjectId format
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message = `Invalid ID format: ${err.value}`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
