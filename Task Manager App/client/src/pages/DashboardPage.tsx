import React from 'react'
import { CheckSquare, Clock, AlertCircle, TrendingUp } from 'lucide-react'

const DashboardPage: React.FC = () => {
  // Mock data for now - will be replaced with real data from API
  const stats = [
    {
      name: 'Total Tasks',
      value: '24',
      icon: CheckSquare,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100'
    },
    {
      name: 'In Progress',
      value: '8',
      icon: Clock,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100'
    },
    {
      name: 'Overdue',
      value: '3',
      icon: AlertCircle,
      color: 'text-danger-600',
      bgColor: 'bg-danger-100'
    },
    {
      name: 'Completed',
      value: '13',
      icon: TrendingUp,
      color: 'text-success-600',
      bgColor: 'bg-success-100'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's an overview of your tasks.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="card p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-md ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Tasks</h3>
            <div className="space-y-3">
              {/* Mock recent tasks */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">
                    Complete project proposal
                  </span>
                </div>
                <span className="text-xs text-gray-500">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-warning-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">
                    Review design mockups
                  </span>
                </div>
                <span className="text-xs text-gray-500">4 hours ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">
                    Update documentation
                  </span>
                </div>
                <span className="text-xs text-gray-500">1 day ago</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Deadlines</h3>
            <div className="space-y-3">
              {/* Mock upcoming deadlines */}
              <div className="flex items-center justify-between p-3 bg-danger-50 rounded-lg border border-danger-200">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-4 h-4 text-danger-500" />
                  <span className="text-sm font-medium text-gray-900">
                    Client presentation
                  </span>
                </div>
                <span className="text-xs text-danger-600 font-medium">Tomorrow</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-warning-50 rounded-lg border border-warning-200">
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-warning-500" />
                  <span className="text-sm font-medium text-gray-900">
                    Code review
                  </span>
                </div>
                <span className="text-xs text-warning-600 font-medium">In 3 days</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    Team meeting prep
                  </span>
                </div>
                <span className="text-xs text-gray-500">In 1 week</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage