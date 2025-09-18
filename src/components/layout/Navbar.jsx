import { Link, useLocation } from 'react-router-dom'
import { formatCarName, getUserTierInfo } from '../../utils/userUtils'
import NotificationCenter from './NotificationCenter'

const Navbar = ({ user, onLogout }) => {
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path
  }

  const tierInfo = getUserTierInfo(user)

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🚗</span>
            <span className="text-xl font-bold text-blue-600">RoadTrip Convoy</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/trips"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/trips') || isActive('/')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Browse Trips
            </Link>
            
            <Link
              to="/trips/create"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/trips/create') || isActive('/create-trip')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Create Trip
            </Link>
            
            <Link
              to="/notifications"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/notifications')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Notifications
            </Link>
            
            <Link
              to="/profile"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/profile')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              My Profile
            </Link>

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/admin')
                    ? 'bg-red-100 text-red-700'
                    : 'text-gray-700 hover:text-red-600'
                }`}
              >
                Admin Panel
              </Link>
            )}
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <NotificationCenter user={user} />

            {/* Tier Badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              user.tier === 'free' 
                ? 'bg-gray-100 text-gray-700'
                : user.tier === 'premium_monthly'
                ? 'bg-blue-100 text-blue-700'
                : user.tier === 'admin'
                ? 'bg-red-100 text-red-700'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {user.tier === 'admin' ? 'Admin' : tierInfo.name}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500">{formatCarName(user)}</div>
              </div>
              
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              
              <button
                onClick={onLogout}
                className="text-gray-500 hover:text-gray-700 text-sm"
                title="Logout"
              >
                🚪
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              user.tier === 'free' 
                ? 'bg-gray-100 text-gray-700'
                : user.tier === 'premium_monthly'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {tierInfo.name}
            </div>
            
            <button
              onClick={onLogout}
              className="text-gray-500 hover:text-gray-700"
              title="Logout"
            >
              🚪
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t bg-gray-50">
        <div className="px-4 py-3 space-y-2">
          <Link
            to="/trips"
            className={`block px-3 py-2 rounded-md text-sm font-medium ${
              isActive('/trips') || isActive('/')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700'
            }`}
          >
            🔍 Browse Trips
          </Link>
          
          <Link
            to="/create-trip"
            className={`block px-3 py-2 rounded-md text-sm font-medium ${
              isActive('/create-trip')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700'
            }`}
          >
            ➕ Create Trip
          </Link>
          
          <Link
            to="/profile"
            className={`block px-3 py-2 rounded-md text-sm font-medium ${
              isActive('/profile')
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-700'
            }`}
          >
            👤 My Profile
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar