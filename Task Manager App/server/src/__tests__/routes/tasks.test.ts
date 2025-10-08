import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import taskRoutes from '../../routes/tasks';
import { authenticate } from '../../middleware/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create express app for testing
const app = express();
app.use(express.json());
app.use('/api/tasks', authenticate, taskRoutes);

const mockUser = {
  id: 'user123',
  email: 'test@test.com',
  username: 'testuser',
};

const getAuthToken = () => {
  return jwt.sign(mockUser, process.env.JWT_SECRET!);
};

describe('Task Routes', () => {
  beforeEach(() => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
  });

  describe('GET /api/tasks', () => {
    it('should get all tasks for authenticated user', async () => {
      const mockTasks = [
        {
          id: 'task1',
          title: 'Task 1',
          description: 'Description 1',
          status: 'TODO',
          priority: 'HIGH',
          userId: mockUser.id,
          category: null,
          comments: [],
          attachments: [],
        },
        {
          id: 'task2',
          title: 'Task 2',
          description: 'Description 2',
          status: 'IN_PROGRESS',
          priority: 'MEDIUM',
          userId: mockUser.id,
          category: null,
          comments: [],
          attachments: [],
        },
      ];

      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].title).toBe('Task 1');
    });

    it('should filter tasks by status', async () => {
      const mockTasks = [
        { id: 'task1', title: 'Task 1', status: 'TODO', userId: mockUser.id },
      ];

      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      const response = await request(app)
        .get('/api/tasks?status=TODO')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(response.status).toBe(200);
      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockUser.id,
            status: 'TODO',
          }),
        })
      );
    });

    it('should filter tasks by priority', async () => {
      (prisma.task.findMany as jest.Mock).mockResolvedValue([]);

      await request(app)
        .get('/api/tasks?priority=HIGH')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockUser.id,
            priority: 'HIGH',
          }),
        })
      );
    });

    it('should search tasks by title and description', async () => {
      (prisma.task.findMany as jest.Mock).mockResolvedValue([]);

      await request(app)
        .get('/api/tasks?search=meeting')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockUser.id,
            OR: expect.arrayContaining([
              expect.objectContaining({ title: expect.anything() }),
              expect.objectContaining({ description: expect.anything() }),
            ]),
          }),
        })
      );
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should get a single task by id', async () => {
      const mockTask = {
        id: 'task1',
        title: 'Task 1',
        description: 'Description',
        status: 'TODO',
        userId: mockUser.id,
        category: null,
        comments: [],
        attachments: [],
      };

      (prisma.task.findFirst as jest.Mock).mockResolvedValue(mockTask);

      const response = await request(app)
        .get('/api/tasks/task1')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('task1');
    });

    it('should return 404 if task not found', async () => {
      (prisma.task.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/tasks/nonexistent')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should not allow access to other users tasks', async () => {
      (prisma.task.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/tasks/other-user-task')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(response.status).toBe(404);
      expect(prisma.task.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockUser.id,
          }),
        })
      );
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const newTask = {
        title: 'New Task',
        description: 'New Description',
        priority: 'HIGH',
      };

      (prisma.task.findFirst as jest.Mock).mockResolvedValue(null); // No last task
      (prisma.task.create as jest.Mock).mockResolvedValue({
        id: 'task123',
        ...newTask,
        status: 'TODO',
        userId: mockUser.id,
        position: 0,
        category: null,
        comments: [],
        attachments: [],
      });

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send(newTask);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(newTask.title);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ description: 'Missing title' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate title length', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ title: 'a'.repeat(256) }); // Max is 255

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate priority enum', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ title: 'Task', priority: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should set position based on last task', async () => {
      (prisma.task.findFirst as jest.Mock).mockResolvedValue({ position: 5 });
      (prisma.task.create as jest.Mock).mockImplementation((args) => ({
        id: 'task123',
        ...args.data,
      }));

      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ title: 'New Task' });

      expect(prisma.task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            position: 6,
          }),
        })
      );
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update an existing task', async () => {
      const existingTask = {
        id: 'task1',
        title: 'Old Title',
        userId: mockUser.id,
      };

      const updatedData = {
        title: 'Updated Title',
        status: 'IN_PROGRESS',
      };

      (prisma.task.findFirst as jest.Mock).mockResolvedValue(existingTask);
      (prisma.task.update as jest.Mock).mockResolvedValue({
        ...existingTask,
        ...updatedData,
        category: null,
        comments: [],
        attachments: [],
      });

      const response = await request(app)
        .put('/api/tasks/task1')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Title');
    });

    it('should return 404 if task not found', async () => {
      (prisma.task.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put('/api/tasks/nonexistent')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should validate status enum', async () => {
      (prisma.task.findFirst as jest.Mock).mockResolvedValue({
        id: 'task1',
        userId: mockUser.id,
      });

      const response = await request(app)
        .put('/api/tasks/task1')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const task = {
        id: 'task1',
        title: 'Task to delete',
        userId: mockUser.id,
      };

      (prisma.task.findFirst as jest.Mock).mockResolvedValue(task);
      (prisma.task.delete as jest.Mock).mockResolvedValue(task);

      const response = await request(app)
        .delete('/api/tasks/task1')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: 'task1' },
      });
    });

    it('should return 404 if task not found', async () => {
      (prisma.task.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/tasks/nonexistent')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(prisma.task.delete).not.toHaveBeenCalled();
    });

    it('should not allow deleting other users tasks', async () => {
      (prisma.task.findFirst as jest.Mock).mockResolvedValue(null);

      await request(app)
        .delete('/api/tasks/other-user-task')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(prisma.task.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockUser.id,
          }),
        })
      );
    });
  });
});
