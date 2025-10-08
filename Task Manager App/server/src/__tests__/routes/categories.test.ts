import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import categoryRoutes from '../../routes/categories';
import { authenticate } from '../../middleware/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use('/api/categories', authenticate, categoryRoutes);

const mockUser = {
  id: 'user123',
  email: 'test@test.com',
  username: 'testuser',
};

const getAuthToken = () => jwt.sign(mockUser, process.env.JWT_SECRET!);

describe('Category Routes', () => {
  beforeEach(() => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
  });

  describe('GET /api/categories', () => {
    it('should get all categories with task counts', async () => {
      const mockCategories = [
        { id: 'cat1', name: 'Work', color: '#FF0000', userId: mockUser.id },
        { id: 'cat2', name: 'Personal', color: '#00FF00', userId: mockUser.id },
      ];

      (prisma.category.findMany as jest.Mock).mockResolvedValue(mockCategories);
      (prisma.task.count as jest.Mock)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(3);

      const response = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].taskCount).toBe(5);
      expect(response.body.data[1].taskCount).toBe(3);
    });
  });

  describe('GET /api/categories/:id', () => {
    it('should get a single category with task count', async () => {
      const mockCategory = {
        id: 'cat1',
        name: 'Work',
        color: '#FF0000',
        userId: mockUser.id,
      };

      (prisma.category.findFirst as jest.Mock).mockResolvedValue(mockCategory);
      (prisma.task.count as jest.Mock).mockResolvedValue(5);

      const response = await request(app)
        .get('/api/categories/cat1')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Work');
      expect(response.body.data.taskCount).toBe(5);
    });

    it('should return 404 if category not found', async () => {
      (prisma.category.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/categories/nonexistent')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/categories', () => {
    it('should create a new category', async () => {
      const newCategory = {
        name: 'Projects',
        description: 'Project tasks',
        color: '#0000FF',
        icon: '📁',
      };

      (prisma.category.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.category.create as jest.Mock).mockResolvedValue({
        id: 'cat123',
        ...newCategory,
        userId: mockUser.id,
      });

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send(newCategory);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Projects');
      expect(response.body.data.taskCount).toBe(0);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ description: 'Missing name' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate color format', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ name: 'Test', color: 'invalid-color' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should prevent duplicate category names', async () => {
      (prisma.category.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing',
        name: 'Work',
      });

      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ name: 'Work', color: '#FF0000' });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('already exists');
    });

    it('should validate name length', async () => {
      const response = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ name: 'a'.repeat(101), color: '#FF0000' }); // Max is 100

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/categories/:id', () => {
    it('should update a category', async () => {
      const existingCategory = {
        id: 'cat1',
        name: 'Work',
        userId: mockUser.id,
      };

      (prisma.category.findFirst as jest.Mock).mockResolvedValue(existingCategory);
      (prisma.category.update as jest.Mock).mockResolvedValue({
        ...existingCategory,
        name: 'Updated Work',
      });
      (prisma.task.count as jest.Mock).mockResolvedValue(3);

      const response = await request(app)
        .put('/api/categories/cat1')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ name: 'Updated Work' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Work');
    });

    it('should return 404 if category not found', async () => {
      (prisma.category.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put('/api/categories/nonexistent')
        .set('Authorization', `Bearer ${getAuthToken()}`)
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('should delete a category with no tasks', async () => {
      (prisma.category.findFirst as jest.Mock).mockResolvedValue({
        id: 'cat1',
        name: 'Empty Category',
        userId: mockUser.id,
      });
      (prisma.task.count as jest.Mock).mockResolvedValue(0);
      (prisma.category.delete as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .delete('/api/categories/cat1')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should prevent deletion of category with tasks', async () => {
      (prisma.category.findFirst as jest.Mock).mockResolvedValue({
        id: 'cat1',
        name: 'Work',
        userId: mockUser.id,
      });
      (prisma.task.count as jest.Mock).mockResolvedValue(5);

      const response = await request(app)
        .delete('/api/categories/cat1')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Cannot delete');
      expect(response.body.error.message).toContain('5 task');
      expect(prisma.category.delete).not.toHaveBeenCalled();
    });

    it('should return 404 if category not found', async () => {
      (prisma.category.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/categories/nonexistent')
        .set('Authorization', `Bearer ${getAuthToken()}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
