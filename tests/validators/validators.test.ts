import {
  registerSchema,
  loginSchema,
} from '../../src/validators/auth.validator';
import {
  createBookSchema,
  bookQuerySchema,
} from '../../src/validators/book.validator';
import { createReviewSchema } from '../../src/validators/review.validator';

describe('Validators', () => {
  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'secret123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject short name', () => {
      const result = registerSchema.safeParse({
        name: 'J',
        email: 'john@example.com',
        password: 'secret123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const result = registerSchema.safeParse({
        name: 'John',
        email: 'not-an-email',
        password: 'secret123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const result = registerSchema.safeParse({
        name: 'John',
        email: 'john@example.com',
        password: '123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const result = loginSchema.safeParse({
        email: 'john@example.com',
        password: 'secret',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('createBookSchema', () => {
    it('should validate correct book data', () => {
      const result = createBookSchema.safeParse({
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '9780132350884',
        genre: 'TECHNOLOGY',
        pages: 464,
        publishedAt: '2008-08-01T00:00:00.000Z',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid ISBN length', () => {
      const result = createBookSchema.safeParse({
        title: 'Test',
        author: 'Author',
        isbn: '123',
        genre: 'FICTION',
        pages: 100,
        publishedAt: '2020-01-01T00:00:00.000Z',
      });
      expect(result.success).toBe(false);
    });

    it('should reject negative pages', () => {
      const result = createBookSchema.safeParse({
        title: 'Test',
        author: 'Author',
        isbn: '9780132350884',
        genre: 'FICTION',
        pages: -10,
        publishedAt: '2020-01-01T00:00:00.000Z',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createReviewSchema', () => {
    it('should validate correct review', () => {
      const result = createReviewSchema.safeParse({
        rating: 5,
        comment: 'Great book!',
      });
      expect(result.success).toBe(true);
    });

    it('should reject rating above 5', () => {
      const result = createReviewSchema.safeParse({ rating: 6 });
      expect(result.success).toBe(false);
    });

    it('should reject rating below 1', () => {
      const result = createReviewSchema.safeParse({ rating: 0 });
      expect(result.success).toBe(false);
    });

    it('should allow review without comment', () => {
      const result = createReviewSchema.safeParse({ rating: 3 });
      expect(result.success).toBe(true);
    });
  });

  describe('bookQuerySchema', () => {
    it('should apply defaults', () => {
      const result = bookQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
        expect(result.data.sortBy).toBe('createdAt');
        expect(result.data.order).toBe('desc');
      }
    });

    it('should reject limit over 100', () => {
      const result = bookQuerySchema.safeParse({ limit: 200 });
      expect(result.success).toBe(false);
    });
  });
});
