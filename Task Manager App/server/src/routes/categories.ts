import express from 'express';
import Joi from 'joi';
import { prisma } from '../index';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Validation schemas
const createCategorySchema = Joi.object({
  name: Joi.string().required().max(100),
  description: Joi.string().optional().allow('').max(500),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#3B82F6'),
  icon: Joi.string().optional().allow('').max(10),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().optional().max(100),
  description: Joi.string().optional().allow('').max(500),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
  icon: Joi.string().optional().allow('').max(10),
});

// @route   GET /api/categories
// @desc    Get all categories for authenticated user
// @access  Private
router.get('/', authenticate, async (req: AuthenticatedRequest, res: any, next: any) => {
  try {
    const categories = await prisma.category.findMany({
      where: {
        userId: req.user!.id,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Get task counts separately
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const taskCount = await prisma.task.count({
          where: { categoryId: category.id }
        });
        return {
          ...category,
          taskCount
        };
      })
    );

    res.json({
      success: true,
      data: categoriesWithCount,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/categories/:id
// @desc    Get single category
// @access  Private
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: any, next: any) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findFirst({
      where: {
        id: id as string,
        userId: req.user!.id,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: { message: 'Category not found' },
      });
    }

    const taskCount = await prisma.task.count({
      where: { categoryId: category.id }
    });

    const categoryWithCount = {
      ...category,
      taskCount
    };

    res.json({
      success: true,
      data: categoryWithCount,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/categories
// @desc    Create new category
// @access  Private
router.post('/', authenticate, async (req: AuthenticatedRequest, res: any, next: any) => {
  try {
    const { error, value } = createCategorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: { message: error.details[0]?.message || 'Validation error' },
      });
    }

    // Check if category name already exists for this user
    const existingCategory = await prisma.category.findFirst({
      where: {
        name: value.name,
        userId: req.user!.id,
      },
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: { message: 'Category with this name already exists' },
      });
    }

    const category = await prisma.category.create({
      data: {
        ...value,
        userId: req.user!.id,
      },
    });

    const categoryWithCount = {
      ...category,
      taskCount: 0
    };

    res.status(201).json({
      success: true,
      data: categoryWithCount,
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private
router.put('/:id', authenticate, async (req: AuthenticatedRequest, res: any, next: any) => {
  try {
    const { id } = req.params;
    const { error, value } = updateCategorySchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: { message: error.details[0]?.message || 'Validation error' },
      });
    }

    // Check if category exists and belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: id as string,
        userId: req.user!.id,
      },
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        error: { message: 'Category not found' },
      });
    }

    const category = await prisma.category.update({
      where: { id: id as string },
      data: value,
    });

    const taskCount = await prisma.task.count({
      where: { categoryId: category.id }
    });

    const categoryWithCount = {
      ...category,
      taskCount
    };

    res.json({
      success: true,
      data: categoryWithCount,
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res: any, next: any) => {
  try {
    const { id } = req.params;

    // Check if category exists and belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: id as string,
        userId: req.user!.id,
      },
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        error: { message: 'Category not found' },
      });
    }

    // Check if category has tasks
    const taskCount = await prisma.task.count({
      where: { categoryId: id as string }
    });

    if (taskCount > 0) {
      return res.status(400).json({
        success: false,
        error: { 
          message: `Cannot delete category with ${taskCount} task(s). Please move or delete the tasks first.` 
        },
      });
    }

    await prisma.category.delete({
      where: { id: id as string },
    });

    res.json({
      success: true,
      data: { message: 'Category deleted successfully' },
    });
  } catch (error) {
    next(error);
  }
});

export default router;