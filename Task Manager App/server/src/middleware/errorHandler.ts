import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: any,
  req: Request,
  res: any,
  next: NextFunction
) => {
  console.error('Error:', error);

  // Prisma errors
  if (error.code === 'P2002') {
    return res.status(400).json({
      success: false,
      error: { message: 'A record with this data already exists' }
    });
  }

  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: { message: 'Record not found' }
    });
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: { message: 'Invalid token' }
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: { message: 'Token expired' }
    });
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: { message: error.message }
    });
  }

  // Default error
  res.status(error.status || 500).json({
    success: false,
    error: {
      message: error.message || 'Internal server error'
    }
  });
};