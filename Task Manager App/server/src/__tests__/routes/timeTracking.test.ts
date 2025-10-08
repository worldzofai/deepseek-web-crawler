import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import timeTrackingRoutes from '../../routes/timeTracking';
import { authenticate } from '../../middleware/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use('/api/time-tracking', authenticate, timeTrackingRoutes);

const mockUser = {
  id: 'user123',
  email: 'test@test.com',
  username: 'testuser',
};

const getAuthToken = () => jwt.sign(mockUser, process.env.JWT_SECRET!);

describe('Time Tracking Routes', () => {
  beforeEach(() => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
  });

  describe('GET /api/time-tracking', () => {
    it('should get time entries for user', async () => {
      const mockEntries = [
        {
          id: 'entry1',
          taskId: 'task1',
          userId: mockUser.id,
          startTime: new Date('2025-01-01T10:00:00Z'),
          endTime: new Date('2025-01-01T11:00:00Z'),
          duration: 60,
          task: { id: 'task1', title: 'Task 1', category: null },
        },
      ];

      (prisma.timeEntry.findMany as jest.Mock).mockResolvedValue(mockEntries);

      const response = await request(app)
        .get('/api/time-tracking')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.entries).toHaveLength(1);
      expect(response.body.data.totalMinutes).toBe(60);
      expect(response.body.data.totalHours).toBe(1);
    });

    it('should filter by taskId', async () => {
      (prisma.timeEntry.findMany as jest.Mock).mockResolvedValue([]);

      await request(app)
        .get('/api/time-tracking?taskId=task123')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(prisma.timeEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            taskId: 'task123',
          }),
        })
      );
    });

    it('should filter by date range', async () => {
      (prisma.timeEntry.findMany as jest.Mock).mockResolvedValue([]);

      await request(app)
        .get('/api/time-tracking?startDate=2025-01-01&endDate=2025-12-31')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(prisma.timeEntry.findMany).toHaveBeenCalled();
    });

    it('should validate date format', async () => {
      const response = await request(app)
        .get('/api/time-tracking?startDate=invalid-date')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/time-tracking/start', () => {
    it('should start time tracking', async () => {
      const mockEntry = {
        id: 'entry123',
        taskId: 'task123',
        userId: mockUser.id,
        startTime: new Date(),
        endTime: null,
        task: { id: 'task123', title: 'Test Task', category: null },
      };

      (prisma.timeEntry.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.timeEntry.create as jest.Mock).mockResolvedValue(mockEntry);

      const response = await request(app)
        .post('/api/time-tracking/start')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({
          taskId: 'task123',
          description: 'Working on feature',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.taskId).toBe('task123');
    });

    it('should prevent starting multiple timers', async () => {
      (prisma.timeEntry.findFirst as jest.Mock).mockResolvedValue({
        id: 'active-entry',
        userId: mockUser.id,
        endTime: null,
      });

      const response = await request(app)
        .post('/api/time-tracking/start')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ taskId: 'task123' });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('already running');
    });

    it('should validate taskId', async () => {
      const response = await request(app)
        .post('/api/time-tracking/start')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ description: 'Missing taskId' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate description length', async () => {
      const response = await request(app)
        .post('/api/time-tracking/start')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({
          taskId: 'task123',
          description: 'a'.repeat(501), // Max is 500
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/time-tracking/stop/:id', () => {
    it('should stop time tracking', async () => {
      const startTime = new Date('2025-01-01T10:00:00Z');
      const mockEntry = {
        id: 'entry123',
        taskId: 'task123',
        userId: mockUser.id,
        startTime: startTime,
        endTime: null,
      };

      (prisma.timeEntry.findFirst as jest.Mock).mockResolvedValue(mockEntry);
      (prisma.timeEntry.update as jest.Mock).mockResolvedValue({
        ...mockEntry,
        endTime: new Date(),
        duration: 60,
        task: { id: 'task123', title: 'Test Task', category: null },
      });
      (prisma.task.update as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .post('/api/time-tracking/stop/entry123')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(prisma.task.update).toHaveBeenCalled();
    });

    it('should return 404 if entry not found', async () => {
      (prisma.timeEntry.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/time-tracking/stop/nonexistent')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should validate entry ID', async () => {
      const response = await request(app)
        .post('/api/time-tracking/stop/')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/time-tracking/active', () => {
    it('should get active timer', async () => {
      const mockEntry = {
        id: 'entry123',
        taskId: 'task123',
        userId: mockUser.id,
        startTime: new Date(),
        endTime: null,
        task: { id: 'task123', title: 'Test Task', category: null },
      };

      (prisma.timeEntry.findFirst as jest.Mock).mockResolvedValue(mockEntry);

      const response = await request(app)
        .get('/api/time-tracking/active')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('entry123');
    });

    it('should return null if no active timer', async () => {
      (prisma.timeEntry.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/time-tracking/active')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeNull();
    });
  });

  describe('GET /api/time-tracking/analytics', () => {
    it('should get analytics for default period', async () => {
      const mockEntries = [
        {
          id: 'entry1',
          duration: 60,
          startTime: new Date(),
          task: {
            id: 'task1',
            title: 'Task 1',
            priority: 'HIGH',
            category: { name: 'Work' },
          },
        },
      ];

      (prisma.timeEntry.findMany as jest.Mock).mockResolvedValue(mockEntries);

      const response = await request(app)
        .get('/api/time-tracking/analytics')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalMinutes).toBe(60);
      expect(response.body.data.totalSessions).toBe(1);
      expect(response.body.data.categoryStats).toBeDefined();
      expect(response.body.data.dailyStats).toBeDefined();
    });

    it('should accept different period values', async () => {
      (prisma.timeEntry.findMany as jest.Mock).mockResolvedValue([]);

      await request(app)
        .get('/api/time-tracking/analytics?period=1d')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      await request(app)
        .get('/api/time-tracking/analytics?period=30d')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      await request(app)
        .get('/api/time-tracking/analytics?period=90d')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(prisma.timeEntry.findMany).toHaveBeenCalledTimes(3);
    });

    it('should validate period parameter', async () => {
      const response = await request(app)
        .get('/api/time-tracking/analytics?period=invalid')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should calculate average session length', async () => {
      const mockEntries = [
        { duration: 60, startTime: new Date(), task: { category: null } },
        { duration: 30, startTime: new Date(), task: { category: null } },
        { duration: 90, startTime: new Date(), task: { category: null } },
      ];

      (prisma.timeEntry.findMany as jest.Mock).mockResolvedValue(mockEntries);

      const response = await request(app)
        .get('/api/time-tracking/analytics')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(response.body.data.totalMinutes).toBe(180);
      expect(response.body.data.averageSessionLength).toBe(60); // 180 / 3
    });
  });
});
