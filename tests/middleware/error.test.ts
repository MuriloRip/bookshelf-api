import { AppError, errorHandler } from '../../src/middleware/error.middleware';
import { Request, Response } from 'express';

describe('Error Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('AppError', () => {
    it('should create an error with status code and message', () => {
      const error = new AppError(404, 'Not found');
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Not found');
      expect(error.name).toBe('AppError');
    });
  });

  describe('errorHandler', () => {
    it('should handle AppError with correct status code', () => {
      const error = new AppError(409, 'Conflict');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Conflict' });
    });

    it('should handle unknown errors with 500 status', () => {
      const error = new Error('Something broke');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});
