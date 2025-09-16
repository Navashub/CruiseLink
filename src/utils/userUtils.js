// User utility functions

// Tier pricing and limits
export const tierInfo = {
  free: {
    name: 'Free',
    price: 0,
    monthlyTripLimit: 1,
    monthlyNotificationLimit: 2,
    canCreateTrips: false,
    features: ['Join unlimited trips', '1 trip creation per month', 'Basic support']
  },
  premium_monthly: {
    name: 'Premium Monthly',
    price: 10,
    monthlyTripLimit: Infinity,
    monthlyNotificationLimit: Infinity,
    canCreateTrips: true,
    features: ['Unlimited trip creation', 'Unlimited notifications', 'Priority support', 'Advanced filtering']
  },
  premium_yearly: {
    name: 'Premium Yearly',
    price: 96,
    monthlyTripLimit: Infinity,
    monthlyNotificationLimit: Infinity,
    canCreateTrips: true,
    features: ['Unlimited trip creation', 'Unlimited notifications', 'Priority support', 'Advanced filtering', '20% savings']
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
  const tier = tierInfo[user.tier]
  if (!tier.canCreateTrips) return false
  
  return user.stats.monthlyTrips < tier.monthlyTripLimit
}

// Check if user can receive more notifications
export const canUserReceiveNotification = (user) => {
  const tier = tierInfo[user.tier]
  return user.stats.notificationsReceived < tier.monthlyNotificationLimit
}

// Get user tier display info
export const getUserTierInfo = (user) => {
  return tierInfo[user.tier]
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
  const points = pointsSystem[action] || 0
  return {
    ...user,
    stats: {
      ...user.stats,
      points: user.stats.points + points
    }
  }
}

// Check if user needs tier upgrade prompt
export const shouldShowUpgradePrompt = (user) => {
  if (user.tier !== 'free') return false
  
  // Show upgrade if user has hit monthly limits
  const tier = tierInfo[user.tier]
  const hitTripLimit = user.stats.monthlyTrips >= tier.monthlyTripLimit
  const hitNotificationLimit = user.stats.notificationsReceived >= tier.monthlyNotificationLimit
  
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