import { Request, Response, NextFunction } from 'express';
import { notFound } from '../../middleware/notFound';

describe('Not Found Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      originalUrl: '/api/nonexistent',
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  it('should return 404 with proper error message', () => {
    notFound(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Route /api/nonexistent not found',
      },
    });
  });

  it('should handle different URLs', () => {
    mockRequest.originalUrl = '/api/unknown/route';

    notFound(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.json).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Route /api/unknown/route not found',
      },
    });
  });

  it('should not call next function', () => {
    notFound(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).not.toHaveBeenCalled();
  });
});
