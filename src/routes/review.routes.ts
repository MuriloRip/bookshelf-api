import { Router } from 'express';
import prisma from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createReviewSchema, updateReviewSchema } from '../validators/review.validator';
import { AppError } from '../middleware/error.middleware';

const router = Router();

/**
 * POST /api/books/:bookId/reviews
 * Add a review to a book.
 */
router.post(
  '/:bookId/reviews',
  authenticate,
  validate(createReviewSchema),
  async (req: AuthRequest, res) => {
    const bookId = parseInt(req.params.bookId);
    const { rating, comment } = req.body;

    const book = await prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      throw new AppError(404, 'Book not found');
    }

    const existing = await prisma.review.findUnique({
      where: { userId_bookId: { userId: req.userId!, bookId } },
    });

    if (existing) {
      throw new AppError(409, 'You have already reviewed this book');
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        userId: req.userId!,
        bookId,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    res.status(201).json(review);
  }
);

/**
 * GET /api/books/:bookId/reviews
 * List all reviews for a book.
 */
router.get('/:bookId/reviews', async (req, res) => {
  const bookId = parseInt(req.params.bookId);
  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { bookId },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.review.count({ where: { bookId } }),
  ]);

  res.json({
    data: reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * PUT /api/books/:bookId/reviews
 * Update your review for a book.
 */
router.put(
  '/:bookId/reviews',
  authenticate,
  validate(updateReviewSchema),
  async (req: AuthRequest, res) => {
    const bookId = parseInt(req.params.bookId);

    const review = await prisma.review.findUnique({
      where: { userId_bookId: { userId: req.userId!, bookId } },
    });

    if (!review) {
      throw new AppError(404, 'Review not found');
    }

    const updated = await prisma.review.update({
      where: { id: review.id },
      data: req.body,
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    res.json(updated);
  }
);

/**
 * DELETE /api/books/:bookId/reviews
 * Delete your review for a book.
 */
router.delete('/:bookId/reviews', authenticate, async (req: AuthRequest, res) => {
  const bookId = parseInt(req.params.bookId);

  const review = await prisma.review.findUnique({
    where: { userId_bookId: { userId: req.userId!, bookId } },
  });

  if (!review) {
    throw new AppError(404, 'Review not found');
  }

  await prisma.review.delete({ where: { id: review.id } });
  res.status(204).send();
});

export default router;
