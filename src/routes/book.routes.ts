import { Router } from 'express';
import prisma from '../config/database';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.middleware';
import { validate, validateQuery } from '../middleware/validate.middleware';
import { createBookSchema, updateBookSchema, bookQuerySchema } from '../validators/book.validator';
import { AppError } from '../middleware/error.middleware';
import { Prisma } from '@prisma/client';

const router = Router();

/**
 * GET /api/books
 * List books with filtering, search, sorting, and pagination.
 */
router.get('/', validateQuery(bookQuerySchema), async (req, res) => {
  const { page, limit, genre, author, search, sortBy, order } = req.query as any;

  const where: Prisma.BookWhereInput = {};

  if (genre) where.genre = genre;
  if (author) where.author = { contains: author, mode: 'insensitive' };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { author: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      orderBy: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: { select: { reviews: true } },
      },
    }),
    prisma.book.count({ where }),
  ]);

  // Calculate average rating for each book
  const booksWithRating = await Promise.all(
    books.map(async (book) => {
      const avgRating = await prisma.review.aggregate({
        where: { bookId: book.id },
        _avg: { rating: true },
      });

      return {
        ...book,
        reviewCount: book._count.reviews,
        averageRating: avgRating._avg.rating
          ? Math.round(avgRating._avg.rating * 10) / 10
          : null,
        _count: undefined,
      };
    })
  );

  res.json({
    data: booksWithRating,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * GET /api/books/:id
 * Get a single book with its reviews.
 */
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      reviews: {
        include: {
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: { select: { reviews: true } },
    },
  });

  if (!book) {
    throw new AppError(404, 'Book not found');
  }

  const avgRating = await prisma.review.aggregate({
    where: { bookId: id },
    _avg: { rating: true },
  });

  res.json({
    ...book,
    reviewCount: book._count.reviews,
    averageRating: avgRating._avg.rating
      ? Math.round(avgRating._avg.rating * 10) / 10
      : null,
    _count: undefined,
  });
});

/**
 * POST /api/books
 * Create a new book (admin only).
 */
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createBookSchema),
  async (req, res) => {
    const data = req.body;

    const existing = await prisma.book.findUnique({ where: { isbn: data.isbn } });
    if (existing) {
      throw new AppError(409, 'Book with this ISBN already exists');
    }

    const book = await prisma.book.create({
      data: {
        ...data,
        publishedAt: new Date(data.publishedAt),
      },
    });

    res.status(201).json(book);
  }
);

/**
 * PUT /api/books/:id
 * Update a book (admin only).
 */
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate(updateBookSchema),
  async (req, res) => {
    const id = parseInt(req.params.id);
    const data = req.body;

    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) {
      throw new AppError(404, 'Book not found');
    }

    if (data.publishedAt) {
      data.publishedAt = new Date(data.publishedAt);
    }

    const updated = await prisma.book.update({ where: { id }, data });
    res.json(updated);
  }
);

/**
 * DELETE /api/books/:id
 * Delete a book (admin only).
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);

  const book = await prisma.book.findUnique({ where: { id } });
  if (!book) {
    throw new AppError(404, 'Book not found');
  }

  await prisma.book.delete({ where: { id } });
  res.status(204).send();
});

export default router;
