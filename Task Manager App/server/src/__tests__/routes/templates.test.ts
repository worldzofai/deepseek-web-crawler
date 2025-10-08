import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import templateRoutes from '../../routes/templates';
import { authenticate } from '../../middleware/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use('/api/templates', authenticate, templateRoutes);

const mockUser = {
  id: 'user123',
  email: 'test@test.com',
  username: 'testuser',
};

const getAuthToken = () => jwt.sign(mockUser, process.env.JWT_SECRET!);

describe('Template Routes', () => {
  beforeEach(() => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
  });

  describe('GET /api/templates', () => {
    it('should get all templates for user', async () => {
      const mockTemplates = [
        {
          id: 'tmpl1',
          name: 'Daily Standup',
          description: 'Template for daily standups',
          priority: 'HIGH',
          userId: mockUser.id,
          category: null,
          _count: { tasks: 5 },
        },
      ];

      (prisma.taskTemplate.findMany as jest.Mock).mockResolvedValue(mockTemplates);

      const response = await request(app)
        .get('/api/templates')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
    });
  });

  describe('POST /api/templates', () => {
    it('should create a new template', async () => {
      const newTemplate = {
        name: 'Weekly Review',
        description: 'Template for weekly review',
        priority: 'MEDIUM',
        estimatedHours: 2,
        tags: ['review', 'weekly'],
      };

      (prisma.taskTemplate.create as jest.Mock).mockResolvedValue({
        id: 'tmpl123',
        ...newTemplate,
        userId: mockUser.id,
        category: null,
      });

      const response = await request(app)
        .post('/api/templates')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send(newTemplate);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Weekly Review');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/templates')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ description: 'Missing name' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate priority enum', async () => {
      const response = await request(app)
        .post('/api/templates')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ name: 'Test', priority: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate tags array', async () => {
      const response = await request(app)
        .post('/api/templates')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({
          name: 'Test',
          tags: Array(21).fill('tag'), // Max is 20
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate recurrence type', async () => {
      const response = await request(app)
        .post('/api/templates')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({
          name: 'Test',
          isRecurring: true,
          recurrenceType: 'INVALID',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/templates/:id', () => {
    it('should update a template', async () => {
      (prisma.taskTemplate.update as jest.Mock).mockResolvedValue({
        id: 'tmpl1',
        name: 'Updated Template',
        userId: mockUser.id,
        category: null,
      });

      const response = await request(app)
        .put('/api/templates/tmpl1')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ name: 'Updated Template' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should validate template ID', async () => {
      const response = await request(app)
        .put('/api/templates/')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/templates/:id', () => {
    it('should delete a template', async () => {
      (prisma.taskTemplate.delete as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .delete('/api/templates/tmpl1')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/templates/:id/create-task', () => {
    it('should create task from template', async () => {
      const mockTemplate = {
        id: 'tmpl1',
        name: 'Daily Standup',
        description: 'Standup meeting',
        priority: 'HIGH',
        estimatedHours: 0.5,
        tags: ['standup'],
        userId: mockUser.id,
        categoryId: null,
      };

      const mockTask = {
        id: 'task123',
        title: 'Daily Standup',
        description: 'Standup meeting',
        priority: 'HIGH',
        userId: mockUser.id,
        category: null,
        template: mockTemplate,
        user: mockUser,
      };

      (prisma.taskTemplate.findFirst as jest.Mock).mockResolvedValue(mockTemplate);
      (prisma.task.create as jest.Mock).mockResolvedValue(mockTask);

      const response = await request(app)
        .post('/api/templates/tmpl1/create-task')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({
          title: 'Custom Title',
          dueDate: '2025-12-31T00:00:00.000Z',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBeDefined();
    });

    it('should return 404 if template not found', async () => {
      (prisma.taskTemplate.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/templates/nonexistent/create-task')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({});

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should validate custom fields', async () => {
      const response = await request(app)
        .post('/api/templates/tmpl1/create-task')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({
          title: 'a'.repeat(256), // Max is 255
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
