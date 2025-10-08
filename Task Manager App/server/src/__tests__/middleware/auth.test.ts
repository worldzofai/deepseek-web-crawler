import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, AuthenticatedRequest } from '../../middleware/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Authentication Middleware', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  describe('authenticate', () => {
    it('should return 401 if no authorization header', async () => {
      await authenticate(
        mockRequest as AuthenticatedRequest,
        mockResponse as any,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: { message: 'Access token required' },
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header does not start with Bearer', async () => {
      mockRequest.headers = { authorization: 'Basic token123' };

      await authenticate(
        mockRequest as AuthenticatedRequest,
        mockResponse as any,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: { message: 'Access token required' },
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if token is invalid', async () => {
      mockRequest.headers = { authorization: 'Bearer invalid-token' };

      await authenticate(
        mockRequest as AuthenticatedRequest,
        mockResponse as any,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: { message: 'Invalid or expired token' },
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if user not found', async () => {
      const token = jwt.sign(
        { id: 'user123', email: 'test@test.com', username: 'testuser' },
        process.env.JWT_SECRET!
      );
      mockRequest.headers = { authorization: `Bearer ${token}` };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await authenticate(
        mockRequest as AuthenticatedRequest,
        mockResponse as any,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: { message: 'User not found' },
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should authenticate successfully with valid token', async () => {
      const userData = {
        id: 'user123',
        email: 'test@test.com',
        username: 'testuser',
      };
      const token = jwt.sign(userData, process.env.JWT_SECRET!);
      mockRequest.headers = { authorization: `Bearer ${token}` };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(userData);

      await authenticate(
        mockRequest as AuthenticatedRequest,
        mockResponse as any,
        nextFunction
      );

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userData.id },
        select: { id: true, email: true, username: true },
      });
      expect(mockRequest.user).toEqual(userData);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should handle expired token', async () => {
      const token = jwt.sign(
        { id: 'user123', email: 'test@test.com', username: 'testuser' },
        process.env.JWT_SECRET!,
        { expiresIn: '-1s' } // Already expired
      );
      mockRequest.headers = { authorization: `Bearer ${token}` };

      await authenticate(
        mockRequest as AuthenticatedRequest,
        mockResponse as any,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        error: { message: 'Invalid or expired token' },
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
});
