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
    const data = await apiClient.get(url)
    return data
  },

  createTrip: async (tripData) => {
    const data = await apiClient.post('/roadtrips/api/trips/', tripData)
    return data
  },

  getTripDetails: async (tripId) => {
    const data = await apiClient.get(`/roadtrips/api/trips/${tripId}/`)
    return data
  },

  updateTrip: async (tripId, tripData) => {
    const data = await apiClient.put(`/roadtrips/api/trips/${tripId}/`, tripData)
    return data
  },

  deleteTrip: async (tripId) => {
    const data = await apiClient.delete(`/roadtrips/api/trips/${tripId}/`)
    return data
  },

  // Trip participation
  joinTrip: async (tripId, joinData = {}) => {
    const data = await apiClient.post(`/roadtrips/api/trips/${tripId}/join/`, joinData)
    return data
  },

  leaveTrip: async (tripId) => {
    const data = await apiClient.post(`/roadtrips/api/trips/${tripId}/leave/`)
    return data
  },

  getTripParticipants: async (tripId) => {
    const data = await apiClient.get(`/roadtrips/api/trips/${tripId}/participants/`)
    return data
  },

  updateParticipantStatus: async (tripId, participantData) => {
    const data = await apiClient.post(`/roadtrips/api/trips/${tripId}/update_participant_status/`, participantData)
    return data
  },

  // Notifications
  getNotifications: async (params = {}) => {
    const searchParams = new URLSearchParams(params)
    const url = `/roadtrips/api/notifications/${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
    const data = await apiClient.get(url)
    return data
  },

  markNotificationRead: async (notificationId) => {
    const data = await apiClient.post(`/roadtrips/api/notifications/${notificationId}/mark_read/`)
    return data
  },

  markAllNotificationsRead: async () => {
    const data = await apiClient.post('/roadtrips/api/notifications/mark_all_read/')
    return data
  },

  getUnreadNotificationCount: async () => {
    const data = await apiClient.get('/roadtrips/api/notifications/unread_count/')
    return data
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