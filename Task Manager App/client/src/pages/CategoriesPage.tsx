import React from 'react'
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react'

const CategoriesPage: React.FC = () => {
  // Mock categories data
  const categories = [
    {
      id: '1',
      name: 'Work',
      description: 'Work-related tasks and projects',
      color: '#3B82F6',
      icon: '💼',
      taskCount: 12
    },
    {
      id: '2',
      name: 'Personal',
      description: 'Personal tasks and activities',
      color: '#10B981',
      icon: '🏠',
      taskCount: 8
    },
    {
      id: '3',
      name: 'Health',
      description: 'Health and fitness related tasks',
      color: '#F59E0B',
      icon: '🏃',
      taskCount: 5
    },
    {
      id: '4',
      name: 'Learning',
      description: 'Educational and skill development tasks',
      color: '#8B5CF6',
      icon: '📚',
      taskCount: 3
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-500">
            Organize your tasks into categories for better management.
          </p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Category
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="card hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-danger-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {category.taskCount} tasks
                  </span>
                </div>
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View Tasks
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add New Category Card */}
        <div className="card border-2 border-dashed border-gray-300 hover:border-primary-400 transition-colors">
          <div className="p-6 text-center">
            <div className="w-12 h-12 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <FolderOpen className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">Create New Category</h3>
            <p className="text-sm text-gray-500 mb-4">
              Add a new category to organize your tasks
            </p>
            <button className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Category Statistics */}
      <div className="card">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Category Overview</h3>
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="font-medium text-gray-900">{category.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{category.taskCount} tasks</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full"
                      style={{ 
                        backgroundColor: category.color,
                        width: `${(category.taskCount / 12) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoriesPage