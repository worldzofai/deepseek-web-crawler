import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth'

const router = Router()
const prisma = new PrismaClient()

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
    res.status(500).json({
      success: false,
      error: { message: error.message }
    })
  }
})

// Create new template
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id
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
    } = req.body

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
    res.status(500).json({
      success: false,
      error: { message: error.message }
    })
  }
})

// Update template
router.put('/:id', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id
    const { id } = req.params
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
    } = req.body

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
    res.status(500).json({
      success: false,
      error: { message: error.message }
    })
  }
})

// Delete template
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id
    const { id } = req.params

    await prisma.taskTemplate.delete({
      where: { id, userId }
    })

    res.json({
      success: true,
      message: 'Template deleted successfully'
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    })
  }
})

// Create task from template
router.post('/:id/create-task', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id
    const { id } = req.params
    const { title, dueDate, customDescription } = req.body

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
    res.status(500).json({
      success: false,
      error: { message: error.message }
    })
  }
})

export default router