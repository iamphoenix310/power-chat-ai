// lib/schema/related.ts
import { z } from 'zod';

export const relatedSchema = z.object({
  object: z.literal('related'),
  data: z.array(z.string()).length(3)
});
