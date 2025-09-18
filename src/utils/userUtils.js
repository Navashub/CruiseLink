// User utility functions

// Tier pricing and limits
export const tierInfo = {
  free: {
    name: 'Free',
    price: 0,
    monthlyTripLimit: 1,
    monthlyNotificationLimit: 2,
    canCreateTrips: true,
    features: ['Join unlimited trips', '1 trip creation per month', 'Basic support']
  },
  premium: {
    name: 'Premium',
    price: 10,
    monthlyTripLimit: 10,
    monthlyNotificationLimit: Infinity,
    canCreateTrips: true,
    features: ['10 trip creation per month', 'Unlimited notifications', 'Priority support', 'Advanced filtering']
  },
  enterprise: {
    name: 'Enterprise',
    price: 200,
    monthlyTripLimit: 100,
    monthlyNotificationLimit: Infinity,
    canCreateTrips: true,
    features: ['100 trip creation per month', 'Unlimited notifications', 'Dedicated support', 'Custom features', 'API access']
  },
  admin: {
    name: 'Admin',
    price: 0,
    monthlyTripLimit: Infinity,
    monthlyNotificationLimit: Infinity,
    canCreateTrips: true,
    features: ['All features', 'Admin panel access', 'User management', 'Platform analytics']
  }
}

// Check if user can create a trip
export const canUserCreateTrip = (user) => {
  if (!user || !user.tier) return false
  
  const tier = tierInfo[user.tier]
  if (!tier || !tier.canCreateTrips) return false
  
  if (!user.stats) return true // If no stats, allow creation (new user)
  
  return (user.stats.monthlyTrips || 0) < tier.monthlyTripLimit
}

// Check if user can receive more notifications
export const canUserReceiveNotification = (user) => {
  if (!user || !user.tier || !user.stats) return true // Default to true for new users
  
  const tier = tierInfo[user.tier]
  return (user.stats.notificationsReceived || 0) < tier.monthlyNotificationLimit
}

// Get user tier display info
export const getUserTierInfo = (user) => {
  if (!user || !user.tier) return tierInfo.free // Default to free tier
  return tierInfo[user.tier] || tierInfo.free
}

// Calculate points for actions
export const pointsSystem = {
  CREATE_TRIP: 50,
  JOIN_TRIP: 20,
  COMPLETE_TRIP: 30,
  VERIFY_CAR: 25,
  INVITE_FRIEND: 40
}

// Add points to user
export const addPointsToUser = (user, action) => {
  if (!user) return user
  
  const points = pointsSystem[action] || 0
  const currentStats = user.stats || {}
  const currentPoints = currentStats.points || 0
  
  return {
    ...user,
    stats: {
      ...currentStats,
      points: currentPoints + points
    }
  }
}

// Check if user needs tier upgrade prompt
export const shouldShowUpgradePrompt = (user) => {
  if (!user || user.tier !== 'free' || !user.stats) return false
  
  // Show upgrade if user has hit monthly limits
  const tier = tierInfo[user.tier]
  const hitTripLimit = (user.stats.monthlyTrips || 0) >= tier.monthlyTripLimit
  const hitNotificationLimit = (user.stats.notificationsReceived || 0) >= tier.monthlyNotificationLimit
  
  return hitTripLimit || hitNotificationLimit
}

// Format car display name
export const formatCarName = (user) => {
  return `${user.carBrand} ${user.carVariant}`
}

// Validate user data
export const validateUserData = (userData) => {
  const errors = []
  
  if (!userData.name || userData.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long')
  }
  
  if (!userData.phone || !userData.phone.match(/^\+?[\d\s-()]+$/)) {
    errors.push('Please enter a valid phone number')
  }
  
  if (!userData.carBrand) {
    errors.push('Please select a car brand')
  }
  
  if (!userData.carModel) {
    errors.push('Please select a car model')
  }
  
  if (!userData.carVariant) {
    errors.push('Please select a car variant')
  }
  
  if (!userData.carType) {
    errors.push('Please select a car type')
  }
  
  if (!userData.photos || userData.photos.length < 2) {
    errors.push('Please upload at least 2 photos of your car')
  }
  
  return errors
}

// Ensure user object has proper default stats
export const ensureUserStats = (user) => {
  if (!user) return null
  
  return {
    ...user,
    stats: {
      monthlyTrips: 0,
      notificationsReceived: 0,
      points: 0,
      ...user.stats
    }
  }
}