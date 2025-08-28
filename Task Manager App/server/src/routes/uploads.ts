import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../index';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

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
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
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

    if (!taskId) {
      // Clean up uploaded file if taskId is missing
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        error: { message: 'Task ID is required' },
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

    // Create attachment record
    const attachment = await prisma.attachment.create({
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
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

    // Delete file from disk
    if (fs.existsSync(attachment.path)) {
      fs.unlinkSync(attachment.path);
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