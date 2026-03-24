import { validate, validateQuery } from '../../src/middleware/validate.middleware';
import { Request, Response } from 'express';
import { z } from 'zod';

describe('Validation Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = { body: {}, query: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  const testSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
  });

  describe('validate (body)', () => {
    it('should call next() for valid body', () => {
      mockReq.body = { name: 'John', email: 'john@example.com' };

      validate(testSchema)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 400 for invalid body', () => {
      mockReq.body = { name: 'J', email: 'invalid' };

      validate(testSchema)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Validation failed' })
      );
    });

    it('should return 400 for missing required fields', () => {
      mockReq.body = {};

      validate(testSchema)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateQuery', () => {
    const querySchema = z.object({
      page: z.coerce.number().int().positive().default(1),
    });

    it('should parse and coerce query params', () => {
      mockReq.query = { page: '3' } as any;

      validateQuery(querySchema)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.query).toEqual({ page: 3 });
    });

    it('should use defaults for missing params', () => {
      mockReq.query = {} as any;

      validateQuery(querySchema)(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.query).toEqual({ page: 1 });
    });
  });
});
