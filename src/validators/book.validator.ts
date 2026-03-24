import { z } from 'zod';

const genreEnum = z.enum([
  'FICTION', 'NON_FICTION', 'SCIENCE', 'TECHNOLOGY', 'HISTORY',
  'BIOGRAPHY', 'FANTASY', 'MYSTERY', 'ROMANCE', 'HORROR',
  'SELF_HELP', 'OTHER',
]);

export const createBookSchema = z.object({
  title: z.string().min(1).max(300),
  author: z.string().min(1).max(200),
  isbn: z.string().length(13, 'ISBN must be exactly 13 characters'),
  description: z.string().max(5000).optional(),
  genre: genreEnum,
  pages: z.number().int().positive().max(10000),
  publishedAt: z.string().datetime(),
  coverUrl: z.string().url().optional(),
});

export const updateBookSchema = createBookSchema.partial();

export const bookQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  genre: genreEnum.optional(),
  author: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['title', 'author', 'publishedAt', 'createdAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type BookQuery = z.infer<typeof bookQuerySchema>;
