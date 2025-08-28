import React, { useState, useEffect } from 'react'
import { Users, UserPlus, Crown, Shield, User, Mail, Calendar, MoreVertical, MessageSquare } from 'lucide-react'

interface TeamMember {
  id: string
  user: {
    id: string
    username: string
    firstName?: string
    lastName?: string
    email: string
    avatar?: string
  }
  role: 'owner' | 'admin' | 'member'
  joinedAt: string
}

interface Team {
  id: string
  name: string
  description?: string
  members: TeamMember[]
  createdAt: string
}

interface AssignedTask {
  id: string
  title: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate?: string
  assignedTo: {
    id: string
    username: string
    firstName?: string
    lastName?: string
  }
  assignedBy: {
    id: string
    username: string
  }
}

const TeamPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([])
  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [loading, setLoading] = useState(true)

  // Mock data for demonstration
  useEffect(() => {
    const mockTeams: Team[] = [
      {
        id: '1',
        name: 'Development Team',
        description: 'Frontend and backend development team',
        members: [
          {
            id: '1',
            user: {
              id: '1',
              username: 'john_doe',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com'
            },
            role: 'owner',
            joinedAt: '2023-01-15T00:00:00Z'
          },
          {
            id: '2',
            user: {
              id: '2',
              username: 'jane_smith',
              firstName: 'Jane',
              lastName: 'Smith',
              email: 'jane@example.com'
            },
            role: 'admin',
            joinedAt: '2023-02-01T00:00:00Z'
          },
          {
            id: '3',
            user: {
              id: '3',
              username: 'bob_wilson',
              firstName: 'Bob',
              lastName: 'Wilson',
              email: 'bob@example.com'
            },
            role: 'member',
            joinedAt: '2023-03-10T00:00:00Z'
          }
        ],
        createdAt: '2023-01-15T00:00:00Z'
      },
      {
        id: '2',
        name: 'Design Team',
        description: 'UI/UX design and creative team',
        members: [
          {
            id: '4',
            user: {
              id: '4',
              username: 'alice_brown',
              firstName: 'Alice',
              lastName: 'Brown',
              email: 'alice@example.com'
            },
            role: 'owner',
            joinedAt: '2023-02-20T00:00:00Z'
          },
          {
            id: '5',
            user: {
              id: '5',
              username: 'charlie_davis',
              firstName: 'Charlie',
              lastName: 'Davis',
              email: 'charlie@example.com'
            },
            role: 'member',
            joinedAt: '2023-03-15T00:00:00Z'
          }
        ],
        createdAt: '2023-02-20T00:00:00Z'
      }
    ]

    const mockAssignedTasks: AssignedTask[] = [
      {
        id: '1',
        title: 'Implement user authentication',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: '2023-12-15T00:00:00Z',
        assignedTo: {
          id: '2',
          username: 'jane_smith',
          firstName: 'Jane',
          lastName: 'Smith'
        },
        assignedBy: {
          id: '1',
          username: 'john_doe'
        }
      },
      {
        id: '2',
        title: 'Design login page mockups',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: '2023-12-20T00:00:00Z',
        assignedTo: {
          id: '4',
          username: 'alice_brown',
          firstName: 'Alice',
          lastName: 'Brown'
        },
        assignedBy: {
          id: '1',
          username: 'john_doe'
        }
      },
      {
        id: '3',
        title: 'Code review for API endpoints',
        status: 'DONE',
        priority: 'LOW',
        assignedTo: {
          id: '3',
          username: 'bob_wilson',
          firstName: 'Bob',
          lastName: 'Wilson'
        },
        assignedBy: {
          id: '1',
          username: 'john_doe'
        }
      }
    ]

    setTimeout(() => {
      setTeams(mockTeams)
      setAssignedTasks(mockAssignedTasks)
      setSelectedTeam(mockTeams[0]?.id || null)
      setLoading(false)
    }, 500)
  }, [])

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-500" />
      case 'admin': return <Shield className="w-4 h-4 text-blue-500" />
      default: return <User className="w-4 h-4 text-gray-500" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'text-yellow-600 bg-yellow-50'
      case 'admin': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'text-gray-600 bg-gray-100'
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-100'
      case 'DONE': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 bg-red-50'
      case 'HIGH': return 'text-orange-600 bg-orange-50'
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50'
      case 'LOW': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const selectedTeamData = teams.find(team => team.id === selectedTeam)

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
          <h1 className="text-2xl font-bold text-gray-900">Team Collaboration</h1>
          <p className="text-gray-600">Manage teams, assign tasks, and collaborate effectively.</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Your Teams</h2>
          <div className="space-y-3">
            {teams.map((team) => (
              <div
                key={team.id}
                onClick={() => setSelectedTeam(team.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedTeam === team.id 
                    ? 'bg-blue-50 border-blue-200 border' 
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{team.name}</h3>
                    <p className="text-sm text-gray-600">{team.members.length} members</p>
                  </div>
                  <Users className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Members */}
        {selectedTeamData && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{selectedTeamData.name}</h2>
              <button className="p-1 text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
            {selectedTeamData.description && (
              <p className="text-gray-600 mb-4">{selectedTeamData.description}</p>
            )}
            <div className="space-y-3">
              {selectedTeamData.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {member.user.firstName?.[0] || member.user.username[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {member.user.firstName && member.user.lastName 
                            ? `${member.user.firstName} ${member.user.lastName}`
                            : member.user.username
                          }
                        </span>
                        {getRoleIcon(member.role)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-3 h-3" />
                        {member.user.email}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assigned Tasks */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Assigned Tasks</h2>
          <div className="space-y-3">
            {assignedTasks.map((task) => (
              <div key={task.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{task.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Assigned to:</span>
                    <span className="font-medium">
                      {task.assignedTo.firstName && task.assignedTo.lastName
                        ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                        : task.assignedTo.username
                      }
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                {task.dueDate && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                    <Calendar className="w-3 h-3" />
                    Due {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Activity Feed */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                <span className="font-medium">Jane Smith</span> commented on 
                <span className="font-medium"> "Implement user authentication"</span>
              </p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                <span className="font-medium">Bob Wilson</span> completed 
                <span className="font-medium"> "Code review for API endpoints"</span>
              </p>
              <p className="text-xs text-gray-500">4 hours ago</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                <span className="font-medium">Charlie Davis</span> joined the 
                <span className="font-medium"> Design Team</span>
              </p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Invite Team Member</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="colleague@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamPage