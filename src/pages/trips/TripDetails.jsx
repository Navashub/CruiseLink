import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { roadtripsAPI } from '../../services'

const TripDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [trip, setTrip] = useState(null)
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadTripDetails()
  }, [id])

  const loadTripDetails = async () => {
    try {
      setLoading(true)
      const [tripResponse, participantsResponse] = await Promise.all([
        roadtripsAPI.getTrip(id),
        roadtripsAPI.getTripParticipants(id)
      ])
      setTrip(tripResponse.data)
      setParticipants(participantsResponse.data.results || participantsResponse.data)
    } catch (err) {
      setError('Failed to load trip details')
      console.error('Error loading trip details:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinTrip = async () => {
    try {
      setActionLoading(true)
      await roadtripsAPI.joinTrip(id)
      await loadTripDetails() // Refresh data
    } catch (err) {
      setError('Failed to join trip')
      console.error('Error joining trip:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleLeaveTrip = async () => {
    if (!window.confirm('Are you sure you want to leave this trip?')) {
      return
    }

    try {
      setActionLoading(true)
      await roadtripsAPI.leaveTrip(id)
      await loadTripDetails() // Refresh data
    } catch (err) {
      setError('Failed to leave trip')
      console.error('Error leaving trip:', err)
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDifficultyColor = (level) => {
    const colors = {
      'easy': 'bg-green-100 text-green-800',
      'moderate': 'bg-yellow-100 text-yellow-800',
      'challenging': 'bg-orange-100 text-orange-800',
      'expert': 'bg-red-100 text-red-800'
    }
    return colors[level] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status) => {
    const colors = {
      'open': 'bg-blue-100 text-blue-800',
      'full': 'bg-red-100 text-red-800',
      'in_progress': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Trip Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'This trip does not exist or has been removed.'}</p>
          <button
            onClick={() => navigate('/trips')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Trips
          </button>
        </div>
      </div>
    )
  }

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  const isParticipant = participants.some(p => p.user?.id === currentUser.id)
  const isOrganizer = trip.organizer?.id === currentUser.id
  const canJoin = trip.status === 'open' && !isParticipant && participants.length < trip.maxParticipants

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/trips')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <span className="mr-2">←</span>
        Back to Trips
      </button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trip Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{trip.title}</h1>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(trip.status)}`}>
                    {trip.status.replace('_', ' ')}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getDifficultyColor(trip.difficultyLevel)}`}>
                    {trip.difficultyLevel}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="w-5 h-5 mr-3 text-gray-500">📍</span>
                  <div>
                    <div className="font-medium">Destination</div>
                    <div className="text-gray-600">{trip.destination}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="w-5 h-5 mr-3 text-gray-500">📅</span>
                  <div>
                    <div className="font-medium">Departure</div>
                    <div className="text-gray-600">{formatDate(trip.departureDateTime)}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="w-5 h-5 mr-3 text-gray-500">📍</span>
                  <div>
                    <div className="font-medium">Meeting Point</div>
                    <div className="text-gray-600">{trip.meetingPoint}</div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="w-5 h-5 mr-3 text-gray-500">👥</span>
                  <div>
                    <div className="font-medium">Participants</div>
                    <div className="text-gray-600">{participants.length} / {trip.maxParticipants}</div>
                  </div>
                </div>
                {trip.estimatedDuration && (
                  <div className="flex items-center">
                    <span className="w-5 h-5 mr-3 text-gray-500">⏱️</span>
                    <div>
                      <div className="font-medium">Duration</div>
                      <div className="text-gray-600">{trip.estimatedDuration}</div>
                    </div>
                  </div>
                )}
                {trip.estimatedDistance && (
                  <div className="flex items-center">
                    <span className="w-5 h-5 mr-3 text-gray-500">🛣️</span>
                    <div>
                      <div className="font-medium">Distance</div>
                      <div className="text-gray-600">{trip.estimatedDistance}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {trip.description && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">About This Trip</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{trip.description}</p>
            </div>
          )}

          {/* Car Eligibility */}
          {(trip.eligibleBrands?.length > 0 || trip.eligibleModels?.length > 0 || trip.eligibleTypes?.length > 0) && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">Eligible Cars</h2>
              <div className="space-y-3">
                {trip.eligibleBrands?.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700">Brands</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {trip.eligibleBrands.map((brand, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                          {brand.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {trip.eligibleModels?.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700">Models</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {trip.eligibleModels.map((model, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded">
                          {model.brand} {model.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {trip.eligibleTypes?.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700">Types</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {trip.eligibleTypes.map((type, index) => (
                        <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded">
                          {type.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-3">
              {canJoin && (
                <button
                  onClick={handleJoinTrip}
                  disabled={actionLoading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? 'Joining...' : 'Join Trip'}
                </button>
              )}
              
              {isParticipant && !isOrganizer && (
                <button
                  onClick={handleLeaveTrip}
                  disabled={actionLoading}
                  className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? 'Leaving...' : 'Leave Trip'}
                </button>
              )}

              {isOrganizer && (
                <button
                  onClick={() => navigate(`/trips/${trip.id}/edit`)}
                  className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Edit Trip
                </button>
              )}

              {!canJoin && !isParticipant && trip.status === 'open' && (
                <div className="text-center text-gray-600 py-3">
                  Trip is full
                </div>
              )}

              {trip.status !== 'open' && !isParticipant && (
                <div className="text-center text-gray-600 py-3">
                  Trip is {trip.status.replace('_', ' ')}
                </div>
              )}
            </div>
          </div>

          {/* Organizer */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Organizer</h2>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                <span className="text-gray-600 font-medium">
                  {trip.organizer?.firstName?.[0]}{trip.organizer?.lastName?.[0]}
                </span>
              </div>
              <div>
                <div className="font-medium">
                  {trip.organizer?.firstName} {trip.organizer?.lastName}
                </div>
                <div className="text-sm text-gray-600">
                  {trip.organizer?.email}
                </div>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">
              Participants ({participants.length}/{trip.maxParticipants})
            </h2>
            <div className="space-y-3">
              {participants.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No participants yet</p>
              ) : (
                participants.map((participant) => (
                  <div key={participant.id} className="flex items-center">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                      <span className="text-gray-600 text-sm font-medium">
                        {participant.user?.firstName?.[0]}{participant.user?.lastName?.[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {participant.user?.firstName} {participant.user?.lastName}
                      </div>
                      <div className="text-sm text-gray-600">
                        Joined {new Date(participant.joinedAt).toLocaleDateString()}
                      </div>
                    </div>
                    {participant.user?.id === trip.organizer?.id && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                        Organizer
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TripDetails