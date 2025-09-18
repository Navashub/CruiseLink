import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { roadtripsAPI } from '../../services'

const TripsList = () => {
  const [trips, setTrips] = useState([])
  const [filteredTrips, setFilteredTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    difficultyLevel: '',
    dateFrom: '',
    dateTo: ''
  })

  useEffect(() => {
    loadTrips()
  }, [])

  useEffect(() => {
    filterTrips()
  }, [trips, searchTerm, filters])

  const loadTrips = async () => {
    try {
      setLoading(true)
      const response = await roadtripsAPI.getTrips()
      setTrips(response.data.results || response.data)
    } catch (err) {
      setError('Failed to load trips')
      console.error('Error loading trips:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterTrips = () => {
    let filtered = [...trips]

    // Text search
    if (searchTerm) {
      filtered = filtered.filter(trip =>
        trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(trip => trip.status === filters.status)
    }

    // Difficulty filter
    if (filters.difficultyLevel) {
      filtered = filtered.filter(trip => trip.difficultyLevel === filters.difficultyLevel)
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(trip => 
        new Date(trip.departureDateTime) >= new Date(filters.dateFrom)
      )
    }

    if (filters.dateTo) {
      filtered = filtered.filter(trip => 
        new Date(trip.departureDateTime) <= new Date(filters.dateTo)
      )
    }

    setFilteredTrips(filtered)
  }

  const handleJoinTrip = async (tripId) => {
    try {
      await roadtripsAPI.joinTrip(tripId)
      loadTrips() // Refresh trips to show updated participant count
    } catch (err) {
      setError('Failed to join trip')
      console.error('Error joining trip:', err)
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Available Trips</h1>
          <p className="text-gray-600 mt-2">Discover and join exciting road trips</p>
        </div>
        <Link
          to="/trips/create"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Trip
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search trips..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="full">Full</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <select
              value={filters.difficultyLevel}
              onChange={(e) => setFilters(prev => ({ ...prev, difficultyLevel: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="challenging">Challenging</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          <div>
            <input
              type="date"
              placeholder="From date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="date"
              placeholder="To date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Trips Grid */}
      {filteredTrips.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚗</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No trips found</h3>
          <p className="text-gray-600 mb-6">
            {trips.length === 0 
              ? "No trips available yet. Be the first to create one!"
              : "Try adjusting your filters to see more trips."
            }
          </p>
          <Link
            to="/trips/create"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create First Trip
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <div key={trip.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">
                    {trip.title}
                  </h3>
                  <div className="flex gap-2 flex-shrink-0">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(trip.status)}`}>
                      {trip.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(trip.difficultyLevel)}`}>
                      {trip.difficultyLevel}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2">📍</span>
                    <span className="truncate">{trip.destination}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2">📅</span>
                    <span>{formatDate(trip.departureDateTime)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-4 h-4 mr-2">👥</span>
                    <span>{trip.currentParticipants || 0} / {trip.maxParticipants} participants</span>
                  </div>
                  {trip.estimatedDuration && (
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2">⏱️</span>
                      <span>{trip.estimatedDuration}</span>
                    </div>
                  )}
                </div>

                {trip.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {trip.description}
                  </p>
                )}

                <div className="flex gap-2">
                  <Link
                    to={`/trips/${trip.id}`}
                    className="flex-1 text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    View Details
                  </Link>
                  {trip.status === 'open' && trip.currentParticipants < trip.maxParticipants && (
                    <button
                      onClick={() => handleJoinTrip(trip.id)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Join Trip
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TripsList