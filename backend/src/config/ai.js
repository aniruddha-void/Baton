/**
 * AI Service Wrapper
 * Enforces API key retrieval from environment, strict timeout control,
 * and character/token input limits to mitigate injection/cost spikes.
 * No silent mock fallback: if the provider key is missing or a live call
 * fails, the error is surfaced so callers can show it to the user.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { AppError } from '../utils/appError.js';

// Load backend/.env explicitly and before this module is evaluated.
// ESM evaluates static imports (including this file, reached via app.js ->
// assistantRoutes -> ai.controller.js -> ai.js) before server.js's own
// dotenv.config() runs, so we load the env file here to ensure
// process.env.AI_API_KEY is present when AIService is constructed.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MAX_INPUT_CHARS = 35000;
const DEFAULT_TIMEOUT_MS = 30000;

// Known placeholder values that must be treated as "not configured".
const AI_PLACEHOLDER_KEYS = [
  'your_gemini_or_openai_api_key_here',
  'your_ai_api_key_here',
];

// Google Gemini REST endpoint (Google AI Studio API key).
// The key is sent via the x-goog-api-key header only — never in the URL,
// logs, or browser bundles.
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = 'gemini-3.5-flash-lite';

export class AIService {
  constructor() {
    this.apiKey = process.env.AI_API_KEY || '';
    this.timeoutMs = DEFAULT_TIMEOUT_MS;
  }

  /**
   * Sanitizes and bounds input size to prevent prompt injection and denial of wallet
   */
  sanitizeInput(prompt) {
    if (typeof prompt !== 'string') {
      return '';
    }
    const trimmed = prompt.trim();
    if (trimmed.length > MAX_INPUT_CHARS) {
      console.warn(`[AI Warning] Input exceeded ${MAX_INPUT_CHARS} characters, truncating.`);
      return trimmed.slice(0, MAX_INPUT_CHARS);
    }
    return trimmed;
  }

  /**
   * Universal completion wrapper.
   * Returns { text, mock }. If no real provider key is configured, an
   * AppError is thrown instead of returning a fake mock, so the callers can
   * tell the user exactly what is missing. If a key IS configured and the
   * live call fails, the error is propagated as-is.
   */
  async generateCompletion(prompt, systemPrompt = 'You are Baton AI, a senior project knowledge handover assistant.') {
    const safePrompt = this.sanitizeInput(prompt);

    if (!this.apiKey || AI_PLACEHOLDER_KEYS.includes(this.apiKey)) {
      throw new AppError(
        'AI API key is not configured. Set AI_API_KEY in backend/.env to enable the AI assistant.',
        503,
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      // Google Gemini REST API (generateContent).
      const response = await fetch(
        `${GEMINI_BASE_URL}/models/${GEMINI_MODEL}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey,
          },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: safePrompt }] },
            ],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { temperature: 0.3 },
          }),
          signal: controller.signal,
        },
      );

      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API returned status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!content) {
        throw new Error('Gemini API returned an empty response.');
      }
      return { text: content, mock: false };
    } catch (err) {
      clearTimeout(timeout);
      // A real key is configured but the provider call failed: propagate the
      // error instead of silently returning a mock synthesis.
      throw err;
    }
  }

}

export const ai = new AIService();

