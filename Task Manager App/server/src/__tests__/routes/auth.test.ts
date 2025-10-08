import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import authRoutes from '../../routes/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Routes', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@test.com',
        username: 'newuser',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user123',
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        createdAt: new Date(),
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
    });

    it('should return 400 if email is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          username: 'testuser',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('email');
    });

    it('should return 400 if username is too short', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@test.com',
          username: 'ab',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 if password is too short', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@test.com',
          username: 'testuser',
          password: '12345',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 if user already exists', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-user',
        email: 'existing@test.com',
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@test.com',
          username: 'existinguser',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('already exists');
    });

    it('should hash password before storing', async () => {
      const userData = {
        email: 'secure@test.com',
        username: 'secureuser',
        password: 'MySecurePassword123',
      };

      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockImplementation(async (args) => {
        // Verify password is hashed
        expect(args.data.password).not.toBe(userData.password);
        expect(args.data.password).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt hash format
        return {
          id: 'user123',
          email: userData.email,
          username: userData.username,
          createdAt: new Date(),
        };
      });

      await request(app).post('/api/auth/register').send(userData);

      expect(prisma.user.create).toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 12);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user123',
        email: 'user@test.com',
        username: 'testuser',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: password,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('user@test.com');
      expect(response.body.data.token).toBeDefined();
    });

    it('should return 401 with invalid email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Invalid credentials');
    });

    it('should return 401 with invalid password', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 12);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user123',
        email: 'user@test.com',
        password: hashedPassword,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Invalid credentials');
    });

    it('should return 400 with missing email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'not-an-email',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should not expose user existence for security', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123',
        });

      // Should return generic "Invalid credentials" message
      expect(response.body.error.message).not.toContain('user');
      expect(response.body.error.message).not.toContain('found');
      expect(response.body.error.message).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user data with valid token', async () => {
      const userData = {
        id: 'user123',
        email: 'user@test.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        avatar: null,
        createdAt: new Date(),
      };

      const token = jwt.sign(
        { id: userData.id, email: userData.email, username: userData.username },
        process.env.JWT_SECRET!
      );

      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(userData) // For authenticate middleware
        .mockResolvedValueOnce(userData); // For the route handler

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
    });

    it('should return 401 without token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('JWT Token Generation', () => {
    it('should generate valid JWT token on register', async () => {
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user123',
        email: 'test@test.com',
        username: 'testuser',
        createdAt: new Date(),
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@test.com',
          username: 'testuser',
          password: 'password123',
        });

      const token = response.body.data.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      expect(decoded.id).toBe('user123');
      expect(decoded.email).toBe('test@test.com');
      expect(decoded.username).toBe('testuser');
      expect(decoded.exp).toBeDefined(); // Token should have expiration
    });

    it('should generate valid JWT token on login', async () => {
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 12);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user123',
        email: 'user@test.com',
        username: 'testuser',
        password: hashedPassword,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'user@test.com',
          password: password,
        });

      const token = response.body.data.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

      expect(decoded.id).toBe('user123');
      expect(decoded.email).toBe('user@test.com');
      expect(decoded.exp).toBeDefined();
    });
  });
});
