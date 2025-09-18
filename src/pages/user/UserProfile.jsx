import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatCarName, getUserTierInfo, tierInfo } from '../../utils/userUtils'
import { sampleTrips } from '../../data/sampleData'

const UserProfile = ({ user, setUser }) => {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedTier, setSelectedTier] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  
  const currentTierInfo = getUserTierInfo(user)
  
  // Get user's trips
  const userCreatedTrips = sampleTrips.filter(trip => trip.organizerId === user.id)
  const userJoinedTrips = sampleTrips.filter(trip => 
    trip.participants.includes(user.id) && trip.organizerId !== user.id
  )

  const handleUpgrade = async (newTier) => {
    setIsProcessing(true)
    setSelectedTier(newTier)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update user tier
    const updatedUser = {
      ...user,
      tier: newTier
    }
    
    setUser(updatedUser)
    localStorage.setItem('roadtripUser', JSON.stringify(updatedUser))
    setShowUpgradeModal(false)
    setIsProcessing(false)
    setSelectedTier('')
  }

  const UpgradeModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 max-w-lg w-full max-h-96 overflow-y-auto">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Upgrade Your Plan</h3>
          <p className="text-gray-600">
            Unlock unlimited features and enhance your road trip experience
          </p>
        </div>

        <div className="space-y-4">
          {/* Premium Monthly */}
          <div className="border-2 border-blue-500 rounded-xl p-6 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              MOST POPULAR
            </div>
            <div className="text-center mb-4">
              <h4 className="text-xl font-bold text-gray-900">Premium Monthly</h4>
              <div className="text-3xl font-bold text-blue-600 mb-2">$10<span className="text-lg text-gray-500">/month</span></div>
            </div>
            
            <ul className="text-sm space-y-2 mb-6">
              {tierInfo.premium_monthly.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            
            <button
              onClick={() => handleUpgrade('premium_monthly')}
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isProcessing && selectedTier === 'premium_monthly' ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Processing...
                </>
              ) : (
                'Upgrade to Monthly'
              )}
            </button>
          </div>

          {/* Premium Yearly */}
          <div className="border-2 border-yellow-500 rounded-xl p-6 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              BEST VALUE
            </div>
            <div className="text-center mb-4">
              <h4 className="text-xl font-bold text-gray-900">Premium Yearly</h4>
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                $96<span className="text-lg text-gray-500">/year</span>
                <div className="text-sm text-green-600 font-medium">Save $24!</div>
              </div>
            </div>
            
            <ul className="text-sm space-y-2 mb-6">
              {tierInfo.premium_yearly.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            
            <button
              onClick={() => handleUpgrade('premium_yearly')}
              disabled={isProcessing}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isProcessing && selectedTier === 'premium_yearly' ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Processing...
                </>
              ) : (
                'Upgrade to Yearly'
              )}
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <button 
            onClick={() => setShowUpgradeModal(false)}
            className="text-gray-500 hover:text-gray-700"
            disabled={isProcessing}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account and track your road trip adventures</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              {/* Profile Picture */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                <p className="text-gray-600">{user.phone}</p>
              </div>

              {/* Current Tier */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">Current Plan</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    user.tier === 'free' 
                      ? 'bg-gray-100 text-gray-700'
                      : user.tier === 'premium_monthly'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {currentTierInfo.name}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Monthly trips</span>
                    <span className="font-medium">
                      {user.stats.monthlyTrips}
                      {currentTierInfo.monthlyTripLimit === Infinity 
                        ? ' (Unlimited)' 
                        : ` / ${currentTierInfo.monthlyTripLimit}`
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Notifications</span>
                    <span className="font-medium">
                      {user.stats.notificationsReceived}
                      {currentTierInfo.monthlyNotificationLimit === Infinity 
                        ? ' (Unlimited)' 
                        : ` / ${currentTierInfo.monthlyNotificationLimit}`
                      }
                    </span>
                  </div>
                </div>

                {user.tier === 'free' && (
                  <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all"
                  >
                    🚀 Upgrade to Premium
                  </button>
                )}
              </div>
            </div>

            {/* Car Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">My Car</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">Vehicle</div>
                  <div className="text-lg font-bold text-gray-900">{formatCarName(user)}</div>
                  <div className="text-sm text-gray-600">{user.carType}</div>
                </div>
                
                {user.photos && user.photos.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Photos</div>
                    <div className="grid grid-cols-2 gap-2">
                      {user.photos.slice(0, 4).map((photo, index) => (
                        <div key={index} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-gray-600 text-xs">
                            Car Photo {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats & Activity */}
          <div className="lg:col-span-2">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{user.stats.tripsCreated}</div>
                <div className="text-sm text-gray-600">Trips Created</div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{user.stats.tripsJoined}</div>
                <div className="text-sm text-gray-600">Trips Joined</div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">{user.stats.points}</div>
                <div className="text-sm text-gray-600">Points Earned</div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {userCreatedTrips.reduce((total, trip) => total + trip.participants.length, 0)}
                </div>
                <div className="text-sm text-gray-600">People Joined</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">My Trips</h3>
                <Link 
                  to="/create-trip"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  ➕ Create Trip
                </Link>
              </div>

              <div className="space-y-6">
                {/* Created Trips */}
                {userCreatedTrips.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">
                      🎯 Trips I've Organized ({userCreatedTrips.length})
                    </h4>
                    <div className="space-y-3">
                      {userCreatedTrips.slice(0, 3).map(trip => (
                        <div key={trip.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-gray-900">{trip.title}</h5>
                              <p className="text-sm text-gray-600">
                                📍 {trip.destination} • {trip.participants.length}/{trip.maxCapacity} joined
                              </p>
                            </div>
                            <Link 
                              to={`/trip/${trip.id}`}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              View →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Joined Trips */}
                {userJoinedTrips.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">
                      🚗 Trips I've Joined ({userJoinedTrips.length})
                    </h4>
                    <div className="space-y-3">
                      {userJoinedTrips.slice(0, 3).map(trip => (
                        <div key={trip.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-gray-900">{trip.title}</h5>
                              <p className="text-sm text-gray-600">
                                📍 {trip.destination} • Organized by {trip.organizer}
                              </p>
                            </div>
                            <Link 
                              to={`/trip/${trip.id}`}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              View →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {userCreatedTrips.length === 0 && userJoinedTrips.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🚗</div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No trips yet</h4>
                    <p className="text-gray-600 mb-6">
                      Start your adventure by creating or joining a road trip!
                    </p>
                    <div className="space-y-3">
                      <Link 
                        to="/create-trip"
                        className="block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        Create Your First Trip
                      </Link>
                      <Link 
                        to="/trips"
                        className="block bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        Browse Available Trips
                      </Link>
                    </div>
                  </div>
                )}

                {/* View All Link */}
                {(userCreatedTrips.length > 3 || userJoinedTrips.length > 3) && (
                  <div className="text-center pt-4">
                    <Link 
                      to="/trips"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View all trips →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showUpgradeModal && <UpgradeModal />}
      </div>
    </div>
  )
}

export default UserProfile