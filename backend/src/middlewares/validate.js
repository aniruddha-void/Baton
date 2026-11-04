import { z } from 'zod';
import mongoose from 'mongoose';

/**
 * Reusable Zod helper for validating MongoDB ObjectIds
 */
export const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid MongoDB ObjectId',
});

/**
 * Validates request body, query, and/or params against Zod schemas
 */
export function validate(schemas) {
  return async (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

