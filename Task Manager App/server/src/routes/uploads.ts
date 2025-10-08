import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { prisma } from '../index';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Allowed MIME types for uploads
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv'
];

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Sanitize filename to prevent path traversal
const sanitizeFilename = (filename: string): string => {
  // Remove any directory path components
  return path.basename(filename).replace(/[^a-zA-Z0-9.-]/g, '_');
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req: any, file: any, cb: any) => {
    // Generate cryptographically secure unique filename
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const sanitizedOriginal = sanitizeFilename(file.originalname);
    const ext = path.extname(sanitizedOriginal);
    const basename = path.basename(sanitizedOriginal, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

// File filter to validate MIME types
const fileFilter = (req: any, file: any, cb: any) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1 // Only allow one file at a time
  },
});

// @route   POST /api/uploads
// @desc    Upload file and attach to task
// @access  Private
router.post('/', authenticate, upload.single('file'), async (req: AuthenticatedRequest, res: any, next: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: 'No file uploaded' },
      });
    }

    const { taskId } = req.body;

    // Validate taskId format (assuming UUID)
    if (!taskId || typeof taskId !== 'string' || taskId.length === 0) {
      // Clean up uploaded file if taskId is invalid
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        error: { message: 'Valid task ID is required' },
      });
    }

    // Verify task exists and belongs to user
    const task = await prisma.task.findFirst({
      where: {
        id: taskId as string,
        userId: req.user!.id,
      },
    });

    if (!task) {
      // Clean up uploaded file if task not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        error: { message: 'Task not found' },
      });
    }

    // Sanitize and validate file data
    const sanitizedOriginalName = sanitizeFilename(req.file.originalname);
    
    // Create attachment record
    const attachment = await prisma.attachment.create({
      data: {
        filename: req.file.filename,
        originalName: sanitizedOriginalName,
        mimeType: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        taskId: taskId as string,
        userId: req.user!.id,
      },
    });

    res.status(201).json({
      success: true,
      data: attachment,
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
});

// @route   DELETE /api/uploads/:id
// @desc    Delete file
// @access  Private
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res: any, next: any) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || typeof id !== 'string' || id.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Valid attachment ID is required' },
      });
    }

    const attachment = await prisma.attachment.findFirst({
      where: {
        id: id as string,
        userId: req.user!.id,
      },
    });

    if (!attachment) {
      return res.status(404).json({
        success: false,
        error: { message: 'File not found' },
      });
    }

    // Delete file from disk securely
    if (fs.existsSync(attachment.path)) {
      // Verify the path is within the upload directory to prevent path traversal
      const uploadPath = path.resolve(process.env.UPLOAD_PATH || './uploads');
      const filePath = path.resolve(attachment.path);
      
      if (filePath.startsWith(uploadPath)) {
        fs.unlinkSync(filePath);
      } else {
        console.error('Attempted path traversal detected:', filePath);
      }
    }

    // Delete attachment record
    await prisma.attachment.delete({
      where: { id: id as string },
    });

    res.json({
      success: true,
      data: { message: 'File deleted successfully' },
    });
  } catch (error) {
    next(error);
  }
});

export default router;