import React, { useState, useEffect } from 'react'
import { Play, Pause, Square, Clock, BarChart3, Calendar, TrendingUp, Target } from 'lucide-react'

interface TimeEntry {
  id: string
  description?: string
  startTime: string
  endTime?: string
  duration?: number
  task: {
    id: string
    title: string
    category?: {
      name: string
      color: string
    }
  }
}

interface ActiveTimer {
  id: string
  startTime: string
  task: {
    id: string
    title: string
    category?: {
      name: string
      color: string
    }
  }
}

interface Analytics {
  totalMinutes: number
  totalHours: number
  totalSessions: number
  averageSessionLength: number
  categoryStats: Record<string, { minutes: number; sessions: number }>
  dailyStats: Record<string, { minutes: number; sessions: number }>
}

const TimeTrackingPage: React.FC = () => {
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null)
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(true)

  // Update current time every second for active timer display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Mock data for demonstration
  useEffect(() => {
    const mockActiveTimer: ActiveTimer = {
      id: '1',
      startTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // Started 45 minutes ago
      task: {
        id: '1',
        title: 'Implement time tracking feature',
        category: {
          name: 'Development',
          color: '#3B82F6'
        }
      }
    }

    const mockTimeEntries: TimeEntry[] = [
      {
        id: '2',
        description: 'Fixed authentication bug',
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        duration: 60,
        task: {
          id: '2',
          title: 'Bug fixes',
          category: {
            name: 'Development',
            color: '#3B82F6'
          }
        }
      },
      {
        id: '3',
        description: 'Team standup meeting',
        startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
        duration: 30,
        task: {
          id: '3',
          title: 'Daily standup',
          category: {
            name: 'Meetings',
            color: '#F59E0B'
          }
        }
      }
    ]

    const mockAnalytics: Analytics = {
      totalMinutes: 480,
      totalHours: 8,
      totalSessions: 12,
      averageSessionLength: 40,
      categoryStats: {
        'Development': { minutes: 360, sessions: 8 },
        'Meetings': { minutes: 90, sessions: 3 },
        'Planning': { minutes: 30, sessions: 1 }
      },
      dailyStats: {
        '2023-12-01': { minutes: 120, sessions: 3 },
        '2023-12-02': { minutes: 180, sessions: 4 },
        '2023-12-03': { minutes: 90, sessions: 2 },
        '2023-12-04': { minutes: 90, sessions: 3 }
      }
    }

    setTimeout(() => {
      setActiveTimer(mockActiveTimer)
      setTimeEntries(mockTimeEntries)
      setAnalytics(mockAnalytics)
      setLoading(false)
    }, 500)
  }, [selectedPeriod])

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getElapsedTime = (startTime: string) => {
    const start = new Date(startTime)
    const elapsed = Math.floor((currentTime.getTime() - start.getTime()) / 1000 / 60)
    return formatDuration(elapsed)
  }

  const handleStartTimer = () => {
    // This would start a new timer
    console.log('Starting timer...')
  }

  const handleStopTimer = () => {
    if (activeTimer) {
      // This would stop the active timer
      console.log('Stopping timer:', activeTimer.id)
      setActiveTimer(null)
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
          <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
          <p className="text-gray-600">Track your time and analyze productivity patterns.</p>
        </div>
      </div>

      {/* Active Timer */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Current Session</h2>
        {activeTimer ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <h3 className="font-medium text-gray-900">{activeTimer.task.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{getElapsedTime(activeTimer.startTime)}</span>
                  {activeTimer.task.category && (
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs text-white"
                      style={{ backgroundColor: activeTimer.task.category.color }}
                    >
                      {activeTimer.task.category.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleStopTimer}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active timer</h3>
            <p className="text-gray-600 mb-4">Start tracking time on a task to see it here.</p>
            <button
              onClick={handleStartTimer}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
            >
              <Play className="w-4 h-4" />
              Start Timer
            </button>
          </div>
        )}
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Time</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalHours}h</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalSessions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Session</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.averageSessionLength}m</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Daily Avg</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(analytics.totalHours / Object.keys(analytics.dailyStats).length * 10) / 10}h
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Time Entries */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Sessions</h2>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="1d">Today</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <div className="space-y-3">
            {timeEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{entry.task.title}</h4>
                  {entry.description && (
                    <p className="text-sm text-gray-600">{entry.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {entry.task.category && (
                      <span 
                        className="px-2 py-0.5 rounded-full text-xs text-white"
                        style={{ backgroundColor: entry.task.category.color }}
                      >
                        {entry.task.category.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-medium text-gray-900">
                    {entry.duration ? formatDuration(entry.duration) : 'In progress'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        {analytics && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Time by Category</h2>
            <div className="space-y-4">
              {Object.entries(analytics.categoryStats).map(([category, stats]) => {
                const percentage = (stats.minutes / analytics.totalMinutes) * 100
                return (
                  <div key={category}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">{category}</span>
                      <span className="text-sm text-gray-600">
                        {formatDuration(stats.minutes)} ({Math.round(percentage)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {stats.sessions} sessions
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TimeTrackingPage