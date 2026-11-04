import { ai } from '../../config/ai.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/response.js';
import { AppError } from '../../utils/appError.js';

/**
 * Chat with the AI assistant. The API key stays on the server (config/ai.js);
 * the frontend only ever sends the user's plain message text.
 */
export const askAssistant = asyncHandler(async (req, res) => {
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

  if (!message) {
    throw new AppError('Message is required.', 400);
  }

  const { text: replyText, mock } = await ai.generateCompletion(message);

  // The backend may return a JSON blob or plain text; normalise for the UI.
  let reply = null;
  try {
    reply = JSON.parse(replyText);
  } catch {
    reply = { body: replyText };
  }

  // Tag the reply so the UI can show "Mock response" only when it really is one.
  if (reply && typeof reply === 'object') {
    reply.mock = !!mock;
  }

  sendResponse(res, 200, { reply }, 'AI response generated');
});
