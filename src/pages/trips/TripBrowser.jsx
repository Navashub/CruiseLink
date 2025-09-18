import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { roadtripsAPI } from '../../services'
import { formatTripDate, getSpotsRemainingText, formatEligibleCars, getDaysUntilTrip } from '../../utils/tripUtils'

const TripBrowser = ({ user }) => {
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [filteredTrips, setFilteredTrips] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all') // all, eligible, joined
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadTrips()
  }, [])

  useEffect(() => {
    loadTrips()
  }, [])

  const loadTrips = async () => {
    try {
      setLoading(true)
      const data = await roadtripsAPI.getTrips()
      const tripsData = data.results || data
      setTrips(tripsData)
      setFilteredTrips(tripsData)
    } catch (err) {
      setError('Failed to load trips')
      console.error('Error loading trips:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = trips.filter(trip => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return trip.title.toLowerCase().includes(query) ||
               trip.destination.toLowerCase().includes(query) ||
               trip.description?.toLowerCase().includes(query)
      }
      return true
    })
    
    // Type filter
    if (filterType === 'eligible') {
      // Filter trips that user is eligible for based on car
      filtered = filtered.filter(trip => {
        // If no specific eligibility requirements, all cars are welcome
        if (!trip.eligibleBrands?.length && !trip.eligibleModels?.length && !trip.eligibleTypes?.length) {
          return true
        }
        
        // Check if user's car matches any of the eligibility criteria
        const userCar = user.car
        if (!userCar) return false
        
        // Check brand eligibility
        if (trip.eligibleBrands?.some(brand => brand.id === userCar.brandId)) return true
        
        // Check model eligibility
        if (trip.eligibleModels?.some(model => model.id === userCar.modelId)) return true
        
        // Check type eligibility
        if (trip.eligibleTypes?.some(type => type.id === userCar.typeId)) return true
        
        return false
      })
    } else if (filterType === 'joined') {
      // This would need to be implemented with actual participation data
      filtered = []
    }
    
    setFilteredTrips(filtered)
  }, [trips, searchQuery, filterType, user])

  const handleJoinTrip = async (tripId) => {
    try {
      setIsLoading(true)
      await roadtripsAPI.joinTrip(tripId)
      await loadTrips() // Refresh trips to show updated data
    } catch (err) {
      setError('Failed to join trip')
      console.error('Error joining trip:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLeaveTrip = async (tripId) => {
    try {
      setIsLoading(true)
      await roadtripsAPI.leaveTrip(tripId)
      await loadTrips() // Refresh trips to show updated data
    } catch (err) {
      setError('Failed to leave trip')
      console.error('Error leaving trip:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const TripCard = ({ trip }) => {
    const currentUser = user
    const isParticipant = trip.participants?.some(p => p.user?.id === currentUser.id) || false
    const canJoin = trip.status === 'open' && !isParticipant && trip.currentParticipants < trip.maxParticipants
    const spotsLeft = trip.maxParticipants - (trip.currentParticipants || 0)
    return (
      <div className="bg-white rounded-xl shadow-lg hover-lift overflow-hidden">
        {/* Trip Header */}
        <div className="gradient-automotive p-6 text-white">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-xl font-bold mb-1">{trip.title}</h3>
              <p className="text-blue-100 flex items-center">
                <span className="mr-2">📍</span>
                {trip.destination}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              spotsLeft === 0 ? 'bg-red-500' :
              spotsLeft <= 5 ? 'bg-yellow-500' : 'bg-green-500'
            }`}>
              {getSpotsRemainingText(trip)}
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center">
              <span className="mr-2">📅</span>
              {daysUntil}
            </span>
            <span className="flex items-center">
              <span className="mr-2">👤</span>
              {trip.organizer}
            </span>
          </div>
        </div>

        {/* Trip Details */}
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">📅 Departure</h4>
              <p className="text-gray-900">{formatTripDate(trip.departureDate)}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">🚗 Meeting Point</h4>
              <p className="text-gray-900">{trip.meetingPoint}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">🚙 Eligible Cars</h4>
              <p className="text-gray-900">{formatEligibleCars(trip.eligibleCars)}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">📝 Description</h4>
              <p className="text-gray-600 text-sm">{trip.description}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="flex items-center space-x-4">
              <Link
                to={`/trip/${trip.id}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Details
              </Link>
              <span className="text-gray-300">•</span>
              <span className="text-sm text-gray-500">
                {trip.participants.length}/{trip.maxCapacity} joined
              </span>
            </div>

            {/* Join/Leave Button */}
            {hasJoined ? (
              <button
                onClick={() => handleLeaveTrip(trip.id)}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? '⏳' : '❌ Leave Trip'}
              </button>
            ) : isEligible && canJoin ? (
              <button
                onClick={() => handleJoinTrip(trip.id)}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? '⏳' : '✅ Join Trip'}
              </button>
            ) : !isEligible ? (
              <div className="px-4 py-2 bg-gray-100 text-gray-500 text-sm rounded-lg cursor-not-allowed">
                🚫 Not Eligible
              </div>
            ) : (
              <div className="px-4 py-2 bg-gray-100 text-gray-500 text-sm rounded-lg cursor-not-allowed">
                😔 Trip Full
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
            <button 
              onClick={loadTrips}
              className="ml-4 text-red-800 underline hover:no-underline"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && (
          <>
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Epic Road Trips</h1>
              <p className="text-gray-600">Find the perfect convoy adventure for your car</p>
            </div>
            <Link
              to="/trips/create"
              className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors hover-lift inline-block text-center"
            >
              ➕ Create Trip
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔍 Search Trips
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, destination, or organizer..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🎯 Filter
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Trips</option>
                  <option value="eligible">Eligible for My Car</option>
                  <option value="joined">My Trips</option>
                </select>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{trips.length}</div>
                <div className="text-sm text-gray-500">Total Trips</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {trips.filter(t => isUserEligibleForTrip(user, t)).length}
                </div>
                <div className="text-sm text-gray-500">Eligible</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {trips.filter(t => t.participants.includes(user.id)).length}
                </div>
                <div className="text-sm text-gray-500">Joined</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trip Cards */}
        {filteredTrips.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {filteredTrips.map(trip => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No trips found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || filterType !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Be the first to create an amazing road trip!'
              }
            </p>
            <Link
              to="/trips/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors hover-lift inline-block"
            >
              Create Your First Trip
            </Link>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  )
}

export default TripBrowser