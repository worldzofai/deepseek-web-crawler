# Task Manager Pro

A comprehensive task management web application with drag-and-drop functionality, calendar integration, and advanced features for productivity and organization.

## Features

### Core Task Management
- ✅ Create, edit, delete, and mark tasks as complete
- ✅ Set task priorities (high, medium, low) with visual indicators
- ✅ Add due dates and time estimates to tasks
- ✅ Organize tasks into categories or projects
- ✅ Search and filter tasks by status, priority, category, or due date

### Drag-and-Drop Interface
- 🎯 Drag-and-drop functionality for reordering tasks within lists
- 🎯 Move tasks between different categories or status columns (To Do, In Progress, Done)
- 🎯 Intuitive board view for visual task management

### Calendar Integration
- 📅 Display tasks in calendar view by due date
- 📅 Create tasks directly from calendar dates
- 📅 Multiple calendar views (month, week, day)
- 📅 Visual deadline tracking and scheduling conflict detection

### Advanced Features
- 💬 Notes/comments system for tasks with rich text editing
- 📎 File attachments for tasks
- 🔗 Task dependencies (prerequisite tasks)
- 📊 Progress tracking with completion percentages
- 🔐 User authentication and personal task lists
- 🎨 Customizable categories with colors and icons

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Query** for data fetching and caching
- **React Beautiful DnD** for drag-and-drop functionality
- **React Big Calendar** for calendar views
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Prisma** as ORM with PostgreSQL
- **JWT** for authentication
- **Multer** for file uploads
- **Joi** for validation
- **bcryptjs** for password hashing

## Project Structure

```
task-manager-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── stores/        # State management
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   ├── prisma/            # Database schema and migrations
│   └── package.json
├── uploads/               # File upload directory
├── .env                   # Environment variables
└── package.json          # Root package.json
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd task-manager-app
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/taskmanager"
   JWT_SECRET="your-super-secret-jwt-key"
   CLIENT_URL="http://localhost:5173"
   ```

4. **Set up the database**
   ```bash
   cd server
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend development server on `http://localhost:5173`
   - Backend API server on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get single task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PUT /api/tasks/reorder` - Reorder tasks

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `GET /api/categories/:id` - Get single category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### File Uploads
- `POST /api/uploads` - Upload file
- `GET /api/uploads/:id/download` - Download file
- `DELETE /api/uploads/:id` - Delete file

## Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- **User** - User accounts and authentication
- **Task** - Core task entity with status, priority, dates
- **Category** - Task organization and grouping
- **Comment** - Task comments and notes
- **Attachment** - File attachments for tasks
- **TaskDependency** - Task prerequisite relationships

## Development

### Available Scripts

```bash
# Install all dependencies
npm run setup

# Start development servers (both frontend and backend)
npm run dev

# Start only frontend
npm run client:dev

# Start only backend
npm run server:dev

# Build for production
npm run build

# Run tests
npm test
```

### Code Style

The project uses:
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Tailwind CSS for consistent styling

## Deployment

### Frontend (Vite Build)
```bash
cd client
npm run build
```

### Backend (Node.js)
```bash
cd server
npm run build
npm start
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use secure JWT secrets
- Configure proper CORS origins
- Set up file upload limits and paths

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@taskmanagerpro.com or create an issue in the repository.

---

**Task Manager Pro** - Organize your work, achieve your goals! 🚀