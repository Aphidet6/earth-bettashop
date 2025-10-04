// Central error handling middleware
// Sends JSON error responses in a consistent shape { success: false, error }
module.exports = function errorHandler(err, req, res, next) {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ success: false, error: message });
};
