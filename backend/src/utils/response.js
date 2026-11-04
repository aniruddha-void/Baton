/**
 * Standard API response formatter: { success, data, message }
 */
export function sendResponse(res, statusCode = 200, data = null, message = '') {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
}

