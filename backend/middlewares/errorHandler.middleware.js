/**
 * Global Error Handling Interceptor Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error(' [Neoकर्म System Error]:', err.stack);

  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An internal server error occurred while processing carbon actions.',
    // Only show stack traces if you're working locally
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;