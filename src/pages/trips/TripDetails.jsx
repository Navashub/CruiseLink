import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { sampleTrips, sampleUsers, getUserById, canUserJoinTrip } from '../../data/sampleData'
import { formatTripDate, getSpotsRemainingText, formatEligibleCars, getDaysUntilTrip, isUserEligibleForTrip } from '../../utils/tripUtils'

const TripDetails = ({ user }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [participants, setParticipants] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)

  useEffect(() => {
    const foundTrip = sampleTrips.find(t => t.id === id)
    if (foundTrip) {
      setTrip(foundTrip)
      // Get participant details
      const participantDetails = foundTrip.participants.map(participantId => 
        getUserById(participantId) || sampleUsers.find(u => u.id === participantId)
      ).filter(Boolean)
      setParticipants(participantDetails)
    }
  }, [id])

  const handleJoinTrip = async () => {
    if (!canUserJoinTrip(user, trip)) return
    
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Update trip participants
    const updatedTrip = {
      ...trip,
      participants: [...trip.participants, user.id]
    }
    
    setTrip(updatedTrip)
    setParticipants(prev => [...prev, user])
    setIsLoading(false)
  }

  const handleLeaveTrip = async () => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Update trip participants
    const updatedTrip = {
      ...trip,
      participants: trip.participants.filter(id => id !== user.id)
    }
    
    setTrip(updatedTrip)
    setParticipants(prev => prev.filter(p => p.id !== user.id))
    setIsLoading(false)
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Trip Not Found</h2>
            <p className="text-gray-600 mb-6">
              The trip you're looking for doesn't exist or has been removed.
            </p>
            <Link 
              to="/trips"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors hover-lift inline-block"
            >
              Browse Other Trips
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isEligible = isUserEligibleForTrip(user, trip)
  const hasJoined = trip.participants.includes(user.id)
  const canJoin = canUserJoinTrip(user, trip)
  const spotsLeft = trip.maxCapacity - trip.participants.length
  const daysUntil = getDaysUntilTrip(trip.departureDate)
  const isOrganizer = trip.organizerId === user.id

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
          >
            ← Back
          </button>
        </div>

        {/* Trip Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="gradient-automotive p-8 text-white">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-3">{trip.title}</h1>
                <p className="text-blue-100 text-lg flex items-center mb-4">
                  <span className="mr-3">📍</span>
                  {trip.destination}
                </p>
                
                <div className="flex items-center space-x-6 text-sm">
                  <span className="flex items-center">
                    <span className="mr-2">📅</span>
                    {daysUntil}
                  </span>
                  <span className="flex items-center">
                    <span className="mr-2">👤</span>
                    Organized by {trip.organizer}
                  </span>
                  <span className="flex items-center">
                    <span className="mr-2">🚗</span>
                    {trip.participants.length}/{trip.maxCapacity} joined
                  </span>
                </div>
              </div>

              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                spotsLeft === 0 ? 'bg-red-500' :
                spotsLeft <= 5 ? 'bg-yellow-500' : 'bg-green-500'
              }`}>
                {getSpotsRemainingText(trip)}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {isOrganizer && (
                  <span className="bg-yellow-500 bg-opacity-20 text-yellow-100 px-3 py-1 rounded-full text-sm font-medium">
                    👑 Your Trip
                  </span>
                )}
                {hasJoined && !isOrganizer && (
                  <span className="bg-green-500 bg-opacity-20 text-green-100 px-3 py-1 rounded-full text-sm font-medium">
                    ✅ Joined
                  </span>
                )}
                {!isEligible && (
                  <span className="bg-red-500 bg-opacity-20 text-red-100 px-3 py-1 rounded-full text-sm font-medium">
                    🚫 Not Eligible
                  </span>
                )}
              </div>

              {!isOrganizer && (
                <div>
                  {hasJoined ? (
                    <button
                      onClick={handleLeaveTrip}
                      disabled={isLoading}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {isLoading ? '⏳ Leaving...' : '❌ Leave Trip'}
                    </button>
                  ) : isEligible && canJoin ? (
                    <button
                      onClick={handleJoinTrip}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {isLoading ? '⏳ Joining...' : '✅ Join Trip'}
                    </button>
                  ) : !isEligible ? (
                    <div className="bg-gray-500 text-white px-6 py-3 rounded-lg font-medium cursor-not-allowed opacity-75">
                      🚫 Not Eligible
                    </div>
                  ) : (
                    <div className="bg-gray-500 text-white px-6 py-3 rounded-lg font-medium cursor-not-allowed opacity-75">
                      😔 Trip Full
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Trip Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Trip Information</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">📅 Departure</h3>
                  <p className="text-gray-900 font-medium">{formatTripDate(trip.departureDate)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">🚗 Meeting Point</h3>
                  <p className="text-gray-900">{trip.meetingPoint}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">🚙 Eligible Cars</h3>
                  <p className="text-gray-900">{formatEligibleCars(trip.eligibleCars)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">👥 Capacity</h3>
                  <p className="text-gray-900">{trip.participants.length} / {trip.maxCapacity} participants</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About This Trip</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{trip.description}</p>
            </div>

            {/* Eligibility Check */}
            {!isEligible && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-red-900 mb-3">🚫 Not Eligible</h3>
                <p className="text-red-700 mb-4">
                  Your {user.carBrand} {user.carVariant} ({user.carType}) doesn't match the eligibility criteria for this trip.
                </p>
                
                <div className="bg-white border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2">This trip is open to:</h4>
                  <p className="text-red-700 text-sm">{formatEligibleCars(trip.eligibleCars)}</p>
                </div>
                
                <div className="mt-4">
                  <Link 
                    to="/trips"
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Find trips for your car →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Organizer Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Trip Organizer</h3>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                  {trip.organizer.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{trip.organizer}</div>
                  <div className="text-sm text-gray-500">Trip Organizer</div>
                </div>
              </div>
              
              {isOrganizer && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm font-medium">
                    👑 This is your trip! Manage participants and trip details.
                  </p>
                </div>
              )}
            </div>

            {/* Participants */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Participants ({participants.length})
                </h3>
                {participants.length > 3 && (
                  <button
                    onClick={() => setShowParticipants(!showParticipants)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {showParticipants ? 'Show Less' : 'Show All'}
                  </button>
                )}
              </div>
              
              <div className="space-y-3">
                {participants.length > 0 ? (
                  <>
                    {(showParticipants ? participants : participants.slice(0, 3)).map(participant => (
                      <div key={participant.id} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {participant.name}
                            {participant.id === trip.organizerId && ' 👑'}
                            {participant.id === user.id && ' (You)'}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {participant.carBrand} {participant.carVariant}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {!showParticipants && participants.length > 3 && (
                      <div className="text-sm text-gray-500 text-center pt-2">
                        +{participants.length - 3} more participants
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">👥</div>
                    <p className="text-gray-500 text-sm">No participants yet</p>
                    <p className="text-gray-400 text-xs mt-1">Be the first to join!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <Link
                  to="/trips"
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors text-center block"
                >
                  🔍 Browse More Trips
                </Link>
                
                <Link
                  to="/create-trip"
                  className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 py-3 px-4 rounded-lg font-medium transition-colors text-center block"
                >
                  ➕ Create Your Own Trip
                </Link>
                
                <Link
                  to="/profile"
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors text-center block"
                >
                  👤 View My Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TripDetails