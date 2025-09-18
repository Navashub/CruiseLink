import { useState, useEffect } from 'react'
import { roadtripsAPI } from '../../services'
import { Link } from 'react-router-dom'

const AdminPanel = ({ user }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTrips: 0,
    totalNotifications: 0,
    freeUsers: 0,
    premiumUsers: 0,
    activeTrips: 0
  })
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      setLoading(true)
      const data = await roadtripsAPI.getTrips()
      const allTrips = data.results || data
      
      setTrips(allTrips)
      
      // Calculate basic stats (would need additional API endpoints for full stats)
      const activeTrips = allTrips.filter(t => t.status === 'open').length

      setStats({
        totalUsers: 'N/A', // Would need users API
        totalTrips: allTrips.length,
        totalNotifications: 'N/A', // Would need notifications API
        freeUsers: 'N/A',
        premiumUsers: 'N/A',
        activeTrips
      })
    } catch (err) {
      console.error('Error loading admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ title, value, icon, color = 'blue' }) => {
    const borderColors = {
      blue: 'border-blue-500',
      green: 'border-green-500',
      gray: 'border-gray-500',
      yellow: 'border-yellow-500'
    }
    
    const textColors = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      gray: 'text-gray-600',
      yellow: 'text-yellow-600'
    }
    
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 border-t-4 ${borderColors[color]}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className={`text-3xl font-bold ${textColors[color]}`}>{value}</p>
          </div>
          <div className="text-4xl">{icon}</div>
        </div>
      </div>
    )
  }

  const UserRow = ({ user: u }) => (
    <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
            {u.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-gray-900">{u.name}</div>
            <div className="text-sm text-gray-500">{u.phone}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">{u.carBrand} {u.carVariant}</div>
        <div className="text-sm text-gray-500">{u.carType}</div>
      </td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          u.tier === 'free' 
            ? 'bg-gray-100 text-gray-800'
            : u.tier === 'premium_monthly'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {u.tier === 'free' ? 'Free' : u.tier === 'premium_monthly' ? 'Premium Monthly' : 'Premium Yearly'}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        <div>Created: {u.stats.tripsCreated}</div>
        <div>Joined: {u.stats.tripsJoined}</div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">{u.stats.points}</td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {new Date(u.createdAt).toLocaleDateString()}
      </td>
    </tr>
  )

  const TripRow = ({ trip }) => (
    <tr key={trip.id} className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="font-medium text-gray-900">{trip.title}</div>
        <div className="text-sm text-gray-500">{trip.destination}</div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">{trip.organizer}</td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
          trip.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {trip.status}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-900">
        {trip.participants.length}/{trip.maxCapacity}
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {new Date(trip.departureDate).toLocaleDateString()}
      </td>
      <td className="px-6 py-4">
        <Link 
          to={`/trip/${trip.id}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View →
        </Link>
      </td>
    </tr>
  )

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access the admin panel.
            </p>
            <Link 
              to="/trips"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Go to Trips
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
              <p className="text-gray-600">Manage users, trips, and platform analytics</p>
            </div>
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium">
              👑 Administrator Access
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Users" value={stats.totalUsers} icon="👥" color="blue" />
          <StatCard title="Active Trips" value={stats.activeTrips} icon="🚗" color="green" />
          <StatCard title="Free Users" value={stats.freeUsers} icon="🆓" color="gray" />
          <StatCard title="Premium Users" value={stats.premiumUsers} icon="⭐" color="yellow" />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 py-3 px-4 rounded-lg font-medium transition-colors">
              📊 Export User Data
            </button>
            <button className="bg-green-100 hover:bg-green-200 text-green-700 py-3 px-4 rounded-lg font-medium transition-colors">
              📈 Generate Reports
            </button>
            <button className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 py-3 px-4 rounded-lg font-medium transition-colors">
              🔔 Send Notifications
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Users</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Car
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trips
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sampleUsers.filter(u => u.id !== 'admin').map(u => (
                  <UserRow key={u.id} user={u} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trips Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Trips</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organizer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    </td>
                  </tr>
                ) : trips.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No trips found
                    </td>
                  </tr>
                ) : (
                  trips.map(trip => (
                    <TripRow key={trip.id} trip={trip} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel