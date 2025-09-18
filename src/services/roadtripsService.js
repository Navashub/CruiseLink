import { apiClient } from './apiClient'

// Road Trips API Service
export const roadtripsAPI = {
  // Trip CRUD operations
  getTrips: async (params = {}) => {
    const searchParams = new URLSearchParams()
    
    // Add filtering parameters
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        searchParams.append(key, params[key])
      }
    })
    
    const url = `/roadtrips/api/trips/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    const response = await apiClient.get(url)
    return response.data
  },

  createTrip: async (tripData) => {
    const response = await apiClient.post('/roadtrips/api/trips/', tripData)
    return response.data
  },

  getTripDetails: async (tripId) => {
    const response = await apiClient.get(`/roadtrips/api/trips/${tripId}/`)
    return response.data
  },

  updateTrip: async (tripId, tripData) => {
    const response = await apiClient.put(`/roadtrips/api/trips/${tripId}/`, tripData)
    return response.data
  },

  deleteTrip: async (tripId) => {
    const response = await apiClient.delete(`/roadtrips/api/trips/${tripId}/`)
    return response.data
  },

  // Trip participation
  joinTrip: async (tripId, joinData = {}) => {
    const response = await apiClient.post(`/roadtrips/api/trips/${tripId}/join/`, joinData)
    return response.data
  },

  leaveTrip: async (tripId) => {
    const response = await apiClient.post(`/roadtrips/api/trips/${tripId}/leave/`)
    return response.data
  },

  getTripParticipants: async (tripId) => {
    const response = await apiClient.get(`/roadtrips/api/trips/${tripId}/participants/`)
    return response.data
  },

  updateParticipantStatus: async (tripId, participantData) => {
    const response = await apiClient.post(`/roadtrips/api/trips/${tripId}/update_participant_status/`, participantData)
    return response.data
  },

  // Notifications
  getNotifications: async (params = {}) => {
    const searchParams = new URLSearchParams(params)
    const url = `/roadtrips/api/notifications/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    const response = await apiClient.get(url)
    return response.data
  },

  markNotificationRead: async (notificationId) => {
    const response = await apiClient.post(`/roadtrips/api/notifications/${notificationId}/mark_read/`)
    return response.data
  },

  markAllNotificationsRead: async () => {
    const response = await apiClient.post('/roadtrips/api/notifications/mark_all_read/')
    return response.data
  },

  getUnreadNotificationCount: async () => {
    const response = await apiClient.get('/roadtrips/api/notifications/unread_count/')
    return response.data
  },

  // Utility methods for frontend filtering
  getMyTrips: async () => {
    return roadtripsAPI.getTrips({ my_trips: 'true' })
  },

  getOrganizedTrips: async () => {
    return roadtripsAPI.getTrips({ organized: 'true' })
  },

  getUpcomingTrips: async () => {
    return roadtripsAPI.getTrips({ upcoming: 'true' })
  },

  getEligibleTrips: async () => {
    return roadtripsAPI.getTrips({ eligible: 'true' })
  },

  searchTrips: async (searchTerm) => {
    return roadtripsAPI.getTrips({ search: searchTerm })
  }
}

// Trip status constants
export const TRIP_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
}

// Difficulty levels
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MODERATE: 'moderate',
  CHALLENGING: 'challenging'
}

// Participation status
export const PARTICIPATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  DECLINED: 'declined',
  CANCELLED: 'cancelled'
}

// Notification types
export const NOTIFICATION_TYPES = {
  NEW_TRIP: 'new_trip',
  TRIP_UPDATED: 'trip_updated',
  TRIP_CANCELLED: 'trip_cancelled',
  JOIN_REQUEST: 'join_request',
  REQUEST_APPROVED: 'request_approved',
  REQUEST_DECLINED: 'request_declined',
  PARTICIPANT_JOINED: 'participant_joined',
  PARTICIPANT_LEFT: 'participant_left',
  TRIP_REMINDER: 'trip_reminder'
}