/**
 * Wraps async route handlers to catch unhandled promise rejections and pass to next()
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

