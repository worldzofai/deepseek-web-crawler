import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Play, Clock, Tag, Repeat } from 'lucide-react'

interface TaskTemplate {
  id: string
  name: string
  description?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  estimatedHours?: number
  tags: string[]
  categoryId?: string
  isRecurring: boolean
  recurrenceType?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  recurrenceInterval?: number
  category?: {
    id: string
    name: string
    color: string
  }
  _count: {
    tasks: number
  }
  createdAt: string
}

const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<TaskTemplate[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock data for now
  useEffect(() => {
    const mockTemplates: TaskTemplate[] = [
      {
        id: '1',
        name: 'Daily Standup Meeting',
        description: 'Prepare for and attend daily standup meeting',
        priority: 'MEDIUM',
        estimatedHours: 0.5,
        tags: ['meeting', 'daily'],
        isRecurring: true,
        recurrenceType: 'DAILY',
        recurrenceInterval: 1,
        category: {
          id: '1',
          name: 'Work',
          color: '#3B82F6'
        },
        _count: { tasks: 15 },
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Weekly Report',
        description: 'Compile and submit weekly progress report',
        priority: 'HIGH',
        estimatedHours: 2,
        tags: ['report', 'weekly'],
        isRecurring: true,
        recurrenceType: 'WEEKLY',
        recurrenceInterval: 1,
        category: {
          id: '1',
          name: 'Work',
          color: '#3B82F6'
        },
        _count: { tasks: 8 },
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Code Review',
        description: 'Review pull requests and provide feedback',
        priority: 'MEDIUM',
        estimatedHours: 1,
        tags: ['code', 'review'],
        isRecurring: false,
        category: {
          id: '1',
          name: 'Work',
          color: '#3B82F6'
        },
        _count: { tasks: 23 },
        createdAt: new Date().toISOString()
      },
      {
        id: '4',
        name: 'Exercise Session',
        description: 'Complete workout routine',
        priority: 'HIGH',
        estimatedHours: 1,
        tags: ['health', 'exercise'],
        isRecurring: true,
        recurrenceType: 'DAILY',
        recurrenceInterval: 1,
        category: {
          id: '2',
          name: 'Health',
          color: '#F59E0B'
        },
        _count: { tasks: 45 },
        createdAt: new Date().toISOString()
      }
    ]
    
    setTimeout(() => {
      setTemplates(mockTemplates)
      setLoading(false)
    }, 500)
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 bg-red-50'
      case 'HIGH': return 'text-orange-600 bg-orange-50'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50'
      case 'LOW': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const handleCreateTask = (template: TaskTemplate) => {
    // This would create a new task from the template
    console.log('Creating task from template:', template)
  }

  const handleEditTemplate = (template: TaskTemplate) => {
    setEditingTemplate(template)
    setShowCreateModal(true)
  }

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(t => t.id !== templateId))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Templates</h1>
          <p className="text-gray-600">Create reusable templates for common tasks and workflows.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  {template.isRecurring && (
                    <div title="Recurring template">
                      <Repeat className="w-4 h-4 text-blue-500" />
                    </div>
                  )}
                </div>
                {template.description && (
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEditTemplate(template)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(template.priority)}`}>
                  {template.priority}
                </span>
                {template.category && (
                  <span 
                    className="px-2 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: template.category.color }}
                  >
                    {template.category.name}
                  </span>
                )}
              </div>

              {template.estimatedHours && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {template.estimatedHours}h estimated
                </div>
              )}

              {template.tags.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Tag className="w-4 h-4" />
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {template.isRecurring && (
                <div className="text-sm text-gray-600">
                  Repeats {template.recurrenceType?.toLowerCase()} 
                  {template.recurrenceInterval && template.recurrenceInterval > 1 && 
                    ` (every ${template.recurrenceInterval})`
                  }
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-sm text-gray-500">
                  Used {template._count.tasks} times
                </span>
                <button
                  onClick={() => handleCreateTask(template)}
                  className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-100 flex items-center gap-1 text-sm"
                >
                  <Play className="w-3 h-3" />
                  Create Task
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
          <p className="text-gray-600 mb-4">Create your first template to get started with reusable tasks.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Template
          </button>
        </div>
      )}

      {/* Create/Edit Template Modal would go here */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </h2>
            <p className="text-gray-600 mb-4">Template creation form would go here...</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingTemplate(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                {editingTemplate ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TemplatesPage