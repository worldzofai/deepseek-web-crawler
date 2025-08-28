import React from 'react'
import { Plus } from 'lucide-react'

const TasksPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and organize your tasks with drag-and-drop functionality.
          </p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </button>
      </div>

      {/* Task Board - Will be implemented with drag-and-drop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">To Do</h3>
            <span className="text-sm text-gray-500">3 tasks</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-primary-500">
              <h4 className="font-medium text-gray-900">Sample Task 1</h4>
              <p className="text-sm text-gray-600 mt-1">This is a sample task description.</p>
              <div className="flex items-center justify-between mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  High Priority
                </span>
                <span className="text-xs text-gray-500">Due: Tomorrow</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">In Progress</h3>
            <span className="text-sm text-gray-500">2 tasks</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-warning-500">
              <h4 className="font-medium text-gray-900">Sample Task 2</h4>
              <p className="text-sm text-gray-600 mt-1">Another sample task in progress.</p>
              <div className="flex items-center justify-between mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                  Medium Priority
                </span>
                <span className="text-xs text-gray-500">Due: Next week</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Done</h3>
            <span className="text-sm text-gray-500">5 tasks</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-success-500">
              <h4 className="font-medium text-gray-900">Completed Task</h4>
              <p className="text-sm text-gray-600 mt-1">This task has been completed.</p>
              <div className="flex items-center justify-between mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
                  Low Priority
                </span>
                <span className="text-xs text-gray-500">Completed: Yesterday</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TasksPage