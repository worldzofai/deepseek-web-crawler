import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { prisma } from '../index'

const router = Router()

// Get time entries for user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id
    const { taskId, startDate, endDate } = req.query

    const where: any = { userId }
    
    if (taskId) {
      where.taskId = taskId as string
    }
    
    if (startDate || endDate) {
      where.startTime = {}
      if (startDate) where.startTime.gte = new Date(startDate as string)
      if (endDate) where.startTime.lte = new Date(endDate as string)
    }

    const timeEntries = await prisma.timeEntry.findMany({
      where,
      include: {
        task: {
          select: { id: true, title: true, category: true }
        }
      },
      orderBy: { startTime: 'desc' }
    })

    // Calculate total time
    const totalMinutes = timeEntries.reduce((sum: number, entry: any) => {
      return sum + (entry.duration || 0)
    }, 0)

    res.json({
      success: true,
      data: {
        entries: timeEntries,
        totalMinutes,
        totalHours: Math.round((totalMinutes / 60) * 100) / 100
      }
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    })
  }
})

// Start time tracking
router.post('/start', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id
    const { taskId, description } = req.body

    // Check if there's already an active timer
    const activeTimer = await prisma.timeEntry.findFirst({
      where: {
        userId,
        endTime: null
      }
    })

    if (activeTimer) {
      return res.status(400).json({
        success: false,
        error: { message: 'Timer already running. Stop current timer first.' }
      })
    }

    const timeEntry = await (prisma as any).timeEntry.create({
      data: {
        taskId,
        userId,
        description,
        startTime: new Date()
      },
      include: {
        task: {
          select: { id: true, title: true, category: true }
        }
      }
    })

    res.status(201).json({
      success: true,
      data: timeEntry
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    })
  }
})

// Stop time tracking
router.post('/stop/:id', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id
    const { id } = req.params

    const timeEntry = await (prisma as any).timeEntry.findFirst({
      where: { id, userId, endTime: null }
    })

    if (!timeEntry) {
      return res.status(404).json({
        success: false,
        error: { message: 'Active time entry not found' }
      })
    }

    const endTime = new Date()
    const duration = Math.round((endTime.getTime() - timeEntry.startTime.getTime()) / (1000 * 60))

    const updatedEntry = await (prisma as any).timeEntry.update({
      where: { id },
      data: {
        endTime,
        duration
      },
      include: {
        task: {
          select: { id: true, title: true, category: true }
        }
      }
    })

    // Update task actual hours
    await prisma.task.update({
      where: { id: timeEntry.taskId },
      data: {
        actualHours: {
          increment: duration / 60
        }
      }
    })

    res.json({
      success: true,
      data: updatedEntry
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    })
  }
})

// Get active timer
router.get('/active', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id

    const activeTimer = await (prisma as any).timeEntry.findFirst({
      where: {
        userId,
        endTime: null
      },
      include: {
        task: {
          select: { id: true, title: true, category: true }
        }
      }
    })

    res.json({
      success: true,
      data: activeTimer
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    })
  }
})

// Get productivity analytics
router.get('/analytics', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.id
    const { period = '7d' } = req.query

    let startDate = new Date()
    switch (period) {
      case '1d':
        startDate.setDate(startDate.getDate() - 1)
        break
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(startDate.getDate() - 90)
        break
    }

    const timeEntries = await (prisma as any).timeEntry.findMany({
      where: {
        userId,
        startTime: { gte: startDate },
        endTime: { not: null }
      },
      include: {
        task: {
          select: { id: true, title: true, category: true, priority: true }
        }
      }
    })

    // Calculate analytics
    const totalMinutes = timeEntries.reduce((sum: number, entry: any) => sum + entry.duration, 0)
    const averageSessionLength = timeEntries.length > 0 ? totalMinutes / timeEntries.length : 0
    
    // Group by category
    const categoryStats = timeEntries.reduce((acc: any, entry: any) => {
      const categoryName = entry.task.category?.name || 'Uncategorized'
      if (!acc[categoryName]) {
        acc[categoryName] = { minutes: 0, sessions: 0 }
      }
      acc[categoryName].minutes += entry.duration
      acc[categoryName].sessions += 1
      return acc
    }, {})

    // Group by day
    const dailyStats = timeEntries.reduce((acc: any, entry: any) => {
      const date = entry.startTime.toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = { minutes: 0, sessions: 0 }
      }
      acc[date].minutes += entry.duration
      acc[date].sessions += 1
      return acc
    }, {})

    res.json({
      success: true,
      data: {
        totalMinutes,
        totalHours: Math.round((totalMinutes / 60) * 100) / 100,
        totalSessions: timeEntries.length,
        averageSessionLength: Math.round(averageSessionLength),
        categoryStats,
        dailyStats
      }
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message }
    })
  }
})

export default router