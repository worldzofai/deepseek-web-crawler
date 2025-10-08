import jwt from 'jsonwebtoken';

export const createMockUser = (overrides = {}) => ({
  id: 'user123',
  email: 'test@test.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  ...overrides,
});

export const createMockTask = (userId: string, overrides = {}) => ({
  id: 'task123',
  title: 'Test Task',
  description: 'Test Description',
  status: 'TODO',
  priority: 'MEDIUM',
  userId,
  position: 0,
  progress: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockCategory = (userId: string, overrides = {}) => ({
  id: 'cat123',
  name: 'Test Category',
  description: 'Test Description',
  color: '#FF0000',
  icon: '📁',
  userId,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const generateAuthToken = (user: any) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
};

export const mockPrismaUser = (prisma: any) => {
  const mockUser = createMockUser();
  (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
  return mockUser;
};

export const expectValidationError = (response: any, field?: string) => {
  expect(response.status).toBe(400);
  expect(response.body.success).toBe(false);
  expect(response.body.error).toBeDefined();
  if (field) {
    expect(response.body.error.message.toLowerCase()).toContain(field.toLowerCase());
  }
};

export const expectNotFoundError = (response: any) => {
  expect(response.status).toBe(404);
  expect(response.body.success).toBe(false);
  expect(response.body.error).toBeDefined();
};

export const expectUnauthorizedError = (response: any) => {
  expect(response.status).toBe(401);
  expect(response.body.success).toBe(false);
  expect(response.body.error).toBeDefined();
};

export const expectSuccessResponse = (response: any, statusCode = 200) => {
  expect(response.status).toBe(statusCode);
  expect(response.body.success).toBe(true);
  expect(response.body.data).toBeDefined();
};
