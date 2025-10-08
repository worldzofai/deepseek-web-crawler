import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import Joi from 'joi'
import { authenticate } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

// Validation schemas
const createTemplateSchema = Joi.object({
  name: Joi.string().required().max(255),
  description: Joi.string().optional().allow('').max(2000),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').default('MEDIUM'),
  estimatedHours: Joi.number().positive().optional().allow(null),
  tags: Joi.array().items(Joi.string().max(50)).max(20).optional(),
  categoryId: Joi.string().optional().allow(null),
  isRecurring: Joi.boolean().default(false),
  recurrenceType: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY').optional().allow(null),
  recurrenceInterval: Joi.number().integer().positive().optional().allow(null),
});

const updateTemplateSchema = Joi.object({
  name: Joi.string().optional().max(255),
  description: Joi.string().optional().allow('').max(2000),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').optional(),
  estimatedHours: Joi.number().positive().optional().allow(null),
  tags: Joi.array().items(Joi.string().max(50)).max(20).optional(),
  categoryId: Joi.string().optional().allow(null),
  isRecurring: Joi.boolean().optional(),
  recurrenceType: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY').optional().allow(null),
  recurrenceInterval: Joi.number().integer().positive().optional().allow(null),
});

const createTaskFromTemplateSchema = Joi.object({
  title: Joi.string().optional().max(255),
  dueDate: Joi.date().iso().optional().allow(null),
  customDescription: Joi.string().optional().allow('').max(2000),
});

// Get all templates for user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id
    
    const templates = await prisma.taskTemplate.findMany({
      where: { userId },
      include: {
        category: true,
        _count: {
          select: { tasks: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json({
      success: true,
      data: templates
    })
  } catch (error: any) {
    console.error('Template error:', error)
    res.status(500).json({
      success: false,
      error: { message: 'An error occurred while processing your request' }
    })
  }
})

// Create new template
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id
    
    const { error, value } = createTemplateSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        error: { message: error.details[0]?.message || 'Validation error' }
      })
    }

    const {
      name,
      description,
      priority,
      estimatedHours,
      tags,
      categoryId,
      isRecurring,
      recurrenceType,
      recurrenceInterval
    } = value

    const template = await prisma.taskTemplate.create({
      data: {
        name,
        description,
        priority,
        estimatedHours,
        tags: tags || [],
        categoryId,
        userId,
        isRecurring: isRecurring || false,
        recurrenceType,
        recurrenceInterval
      },
      include: {
        category: true
      }
    })

    res.status(201).json({
      success: true,
      data: template
    })
  } catch (error: any) {
    console.error('Template error:', error)
    res.status(500).json({
      success: false,
      error: { message: 'An error occurred while processing your request' }
    })
  }
})

// Update template
router.put('/:id', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id
    const { id } = req.params
    
    // Validate ID format
    if (!id || typeof id !== 'string' || id.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Valid template ID is required' }
      })
    }
    
    const { error, value } = updateTemplateSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        error: { message: error.details[0]?.message || 'Validation error' }
      })
    }

    const {
      name,
      description,
      priority,
      estimatedHours,
      tags,
      categoryId,
      isRecurring,
      recurrenceType,
      recurrenceInterval
    } = value

    const template = await prisma.taskTemplate.update({
      where: { id, userId },
      data: {
        name,
        description,
        priority,
        estimatedHours,
        tags,
        categoryId,
        isRecurring,
        recurrenceType,
        recurrenceInterval
      },
      include: {
        category: true
      }
    })

    res.json({
      success: true,
      data: template
    })
  } catch (error: any) {
    console.error('Template error:', error)
    res.status(500).json({
      success: false,
      error: { message: 'An error occurred while processing your request' }
    })
  }
})

// Delete template
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id
    const { id } = req.params
    
    // Validate ID format
    if (!id || typeof id !== 'string' || id.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Valid template ID is required' }
      })
    }

    await prisma.taskTemplate.delete({
      where: { id, userId }
    })

    res.json({
      success: true,
      message: 'Template deleted successfully'
    })
  } catch (error: any) {
    console.error('Template error:', error)
    res.status(500).json({
      success: false,
      error: { message: 'An error occurred while processing your request' }
    })
  }
})

// Create task from template
router.post('/:id/create-task', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id
    const { id } = req.params
    
    // Validate ID format
    if (!id || typeof id !== 'string' || id.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Valid template ID is required' }
      })
    }
    
    const { error, value } = createTaskFromTemplateSchema.validate(req.body)
    if (error) {
      return res.status(400).json({
        success: false,
        error: { message: error.details[0]?.message || 'Validation error' }
      })
    }
    
    const { title, dueDate, customDescription } = value

    const template = await prisma.taskTemplate.findFirst({
      where: { id, userId }
    })

    if (!template) {
      return res.status(404).json({
        success: false,
        error: { message: 'Template not found' }
      })
    }

    const task = await prisma.task.create({
      data: {
        title: title || template.name,
        description: customDescription || template.description,
        priority: template.priority,
        estimatedHours: template.estimatedHours,
        tags: template.tags,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        userId,
        categoryId: template.categoryId,
        templateId: template.id
      },
      include: {
        category: true,
        template: true,
        user: {
          select: { id: true, username: true, firstName: true, lastName: true }
        }
      }
    })

    res.status(201).json({
      success: true,
      data: task
    })
  } catch (error: any) {
    console.error('Template error:', error)
    res.status(500).json({
      success: false,
      error: { message: 'An error occurred while processing your request' }
    })
  }
})

export default router