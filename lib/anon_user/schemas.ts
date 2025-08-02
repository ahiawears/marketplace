// src/lib/anonymous-user/schemas.ts
import { z } from 'zod';

export const CartItemSchema = z.object({
    id: z.string().uuid(),
    product_id: z.string().uuid(),
    quantity: z.number().int().positive(),
    created_at: z.string().datetime(),
    expires_at: z.string().datetime().nullable()
});