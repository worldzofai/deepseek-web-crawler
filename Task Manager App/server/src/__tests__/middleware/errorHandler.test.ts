import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../middleware/errorHandler';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
    // Reset NODE_ENV
    process.env.NODE_ENV = 'test';
  });

  it('should handle Prisma P2002 error (duplicate)', () => {
    const error = { code: 'P2002' };

    errorHandler(error, mockRequest as Request, mockResponse as any, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'A record with this data already exists' },
    });
  });

  it('should handle Prisma P2025 error (not found)', () => {
    const error = { code: 'P2025' };

    errorHandler(error, mockRequest as Request, mockResponse as any, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'Record not found' },
    });
  });

  it('should handle JsonWebTokenError', () => {
    const error = { name: 'JsonWebTokenError' };

    errorHandler(error, mockRequest as Request, mockResponse as any, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'Invalid token' },
    });
  });

  it('should handle TokenExpiredError', () => {
    const error = { name: 'TokenExpiredError' };

    errorHandler(error, mockRequest as Request, mockResponse as any, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'Token expired' },
    });
  });

  it('should handle ValidationError', () => {
    const error = { name: 'ValidationError', message: 'Invalid input' };

    errorHandler(error, mockRequest as Request, mockResponse as any, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'Invalid input' },
    });
  });

  it('should handle Multer LIMIT_FILE_SIZE error', () => {
    const error = { name: 'MulterError', code: 'LIMIT_FILE_SIZE' };

    errorHandler(error, mockRequest as Request, mockResponse as any, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'File size exceeds maximum limit of 5MB' },
    });
  });

  it('should handle Multer LIMIT_FILE_COUNT error', () => {
    const error = { name: 'MulterError', code: 'LIMIT_FILE_COUNT' };

    errorHandler(error, mockRequest as Request, mockResponse as any, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'Too many files uploaded' },
    });
  });

  it('should handle generic Multer error', () => {
    const error = { name: 'MulterError', code: 'UNKNOWN' };

    errorHandler(error, mockRequest as Request, mockResponse as any, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'File upload error' },
    });
  });

  it('should handle CORS error', () => {
    const error = { message: 'Not allowed by CORS' };

    errorHandler(error, mockRequest as Request, mockResponse as any, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'Access forbidden' },
    });
  });

  it('should hide error details in production', () => {
    process.env.NODE_ENV = 'production';
    const error = { message: 'Internal database error', status: 500 };

    errorHandler(error, mockRequest as Request, mockResponse as any, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'An unexpected error occurred' },
    });
  });

  it('should show error details in development', () => {
    process.env.NODE_ENV = 'development';
    const error = { message: 'Database connection failed', status: 500 };

    errorHandler(error, mockRequest as Request, mockResponse as any, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'Database connection failed' },
    });
  });

  it('should use default status 500 if no status provided', () => {
    const error = { message: 'Something went wrong' };

    errorHandler(error, mockRequest as Request, mockResponse as any, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
  });

  it('should use custom status if provided', () => {
    const error = { message: 'Bad request', status: 400 };

    errorHandler(error, mockRequest as Request, mockResponse as any, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
  });
});
