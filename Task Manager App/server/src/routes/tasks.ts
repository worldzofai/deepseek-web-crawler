import express from 'express';
import Joi from 'joi';
import { prisma } from '../index';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Validation schemas
const createTaskSchema = Joi.object({
  title: Joi.string().required().max(255),
  description: Joi.string().optional().allow(''),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').default('MEDIUM'),
  dueDate: Joi.date().iso().optional(),
  estimatedHours: Joi.number().positive().optional(),
  categoryId: Joi.string().optional(),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().optional().max(255),
  description: Joi.string().optional().allow(''),
  status: Joi.string().valid('TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED').optional(),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').optional(),
  dueDate: Joi.date().iso().optional().allow(null),
  estimatedHours: Joi.number().positive().optional().allow(null),
  actualHours: Joi.number().positive().optional().allow(null),
  progress: Joi.number().min(0).max(100).optional(),
  position: Joi.number().integer().optional(),
  categoryId: Joi.string().optional().allow(null),
});

// @route   GET /api/tasks
// @desc    Get all tasks for authenticated user
// @access  Private
router.get('/', authenticate, async (req: AuthenticatedRequest, res: any, next: any) => {
  try {
    const { status, priority, categoryId, search } = req.query;

    const where: any = {
      userId: req.user!.id,
    };

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        category: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        attachments: true,
      },
      orderBy: [
        { position: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: any, next: any) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findFirst({
      where: {
        id: id as string,
        userId: req.user!.id,
      },
      include: {
        category: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        attachments: true,
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: { message: 'Task not found' },
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private
router.post('/', authenticate, async (req: AuthenticatedRequest, res: any, next: any) => {
  try {
    const { error, value } = createTaskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: { message: error.details[0]?.message || 'Validation error' },
      });
    }

    // Get the highest position for ordering
    const lastTask = await prisma.task.findFirst({
      where: { userId: req.user!.id },
      orderBy: { position: 'desc' },
    });

    const position = lastTask ? lastTask.position + 1 : 0;

    const task = await prisma.task.create({
      data: {
        ...value,
        userId: req.user!.id,
        position,
      },
      include: {
        category: true,
        comments: true,
        attachments: true,
      },
    });

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', authenticate, async (req: AuthenticatedRequest, res: any, next: any) => {
  try {
    const { id } = req.params;
    const { error, value } = updateTaskSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: { message: error.details[0]?.message || 'Validation error' },
      });
    }

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: id as string,
        userId: req.user!.id,
      },
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        error: { message: 'Task not found' },
      });
    }

    const task = await prisma.task.update({
      where: { id: id as string },
      data: value,
      include: {
        category: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        attachments: true,
      },
    });

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res: any, next: any) => {
  try {
    const { id } = req.params;

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: id as string,
        userId: req.user!.id,
      },
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        error: { message: 'Task not found' },
      });
    }

    await prisma.task.delete({
      where: { id: id as string },
    });

    res.json({
      success: true,
      data: { message: 'Task deleted successfully' },
    });
  } catch (error) {
    next(error);
  }
});

export default router;