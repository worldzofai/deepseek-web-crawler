import React from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'

const CalendarPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your tasks in calendar format.
          </p>
        </div>
        <button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </button>
      </div>

      {/* Calendar Header */}
      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-md">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">December 2023</h2>
              <button className="p-2 hover:bg-gray-100 rounded-md">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex space-x-2">
              <button className="btn-secondary text-sm">Month</button>
              <button className="btn-secondary text-sm">Week</button>
              <button className="btn-secondary text-sm">Day</button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
            {/* Header row */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-700">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 6 + 1 // Adjust for month start
              const isCurrentMonth = day > 0 && day <= 31
              const isToday = day === 15 // Mock today
              
              return (
                <div
                  key={i}
                  className={`bg-white p-2 min-h-[100px] ${
                    !isCurrentMonth ? 'text-gray-400' : ''
                  } ${isToday ? 'bg-primary-50 border-2 border-primary-200' : ''}`}
                >
                  <div className="text-sm font-medium mb-1">
                    {isCurrentMonth ? day : ''}
                  </div>
                  {/* Sample events */}
                  {day === 15 && (
                    <div className="space-y-1">
                      <div className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded truncate">
                        Team Meeting
                      </div>
                      <div className="text-xs bg-warning-100 text-warning-800 px-2 py-1 rounded truncate">
                        Project Review
                      </div>
                    </div>
                  )}
                  {day === 20 && (
                    <div className="text-xs bg-success-100 text-success-800 px-2 py-1 rounded truncate">
                      Deadline
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Upcoming Events</h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Team Meeting</h4>
              <p className="text-sm text-gray-600">Today at 2:00 PM</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Project Review</h4>
              <p className="text-sm text-gray-600">Today at 4:00 PM</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-3 h-3 bg-success-500 rounded-full"></div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Project Deadline</h4>
              <p className="text-sm text-gray-600">December 20, 2023</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarPage