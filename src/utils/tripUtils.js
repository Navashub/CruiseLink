// Trip utility functions

// Validate trip data
export const validateTripData = (tripData) => {
  const errors = []
  
  if (!tripData.title || tripData.title.trim().length < 3) {
    errors.push('Trip title must be at least 3 characters long')
  }
  
  if (!tripData.destination || tripData.destination.trim().length < 3) {
    errors.push('Destination must be at least 3 characters long')
  }
  
  if (!tripData.meetingPoint || tripData.meetingPoint.trim().length < 5) {
    errors.push('Meeting point must be at least 5 characters long')
  }
  
  if (!tripData.departureDate) {
    errors.push('Please select a departure date')
  } else {
    const departureDate = new Date(tripData.departureDate)
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
    
    if (departureDate < threeDaysFromNow) {
      errors.push('Departure date must be at least 3 days in advance')
    }
  }
  
  if (!tripData.description || tripData.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long')
  }
  
  // Check if at least one eligibility criteria is selected
  const { brands, models, types } = tripData.eligibleCars || { brands: [], models: [], types: [] }
  if (brands.length === 0 && models.length === 0 && types.length === 0) {
    errors.push('Please select at least one car eligibility criteria')
  }
  
  return errors
}

// Check trip eligibility for a user
export const isUserEligibleForTrip = (user, trip) => {
  const { brands, models, types } = trip.eligibleCars
  
  // Check brand eligibility
  const matchesBrand = brands.length === 0 || brands.includes(user.carBrand)
  
  // Check model eligibility (check against user's variant)
  const matchesModel = models.length === 0 || models.includes(user.carVariant)
  
  // Check type eligibility
  const matchesType = types.length === 0 || types.includes(user.carType)
  
  return matchesBrand && matchesModel && matchesType
}

// Format trip date for display
export const formatTripDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Get trip status color
export const getTripStatusColor = (trip) => {
  const spotsLeft = trip.maxCapacity - trip.participants.length
  
  if (spotsLeft === 0) return 'red'
  if (spotsLeft <= 5) return 'yellow'
  return 'green'
}

// Get spots remaining text
export const getSpotsRemainingText = (trip) => {
  const spotsLeft = trip.maxCapacity - trip.participants.length
  
  if (spotsLeft === 0) return 'Trip Full'
  if (spotsLeft === 1) return '1 spot remaining'
  return `${spotsLeft} spots remaining`
}

// Format eligible cars for display
export const formatEligibleCars = (eligibleCars) => {
  const { brands, models, types } = eligibleCars
  const criteria = []
  
  if (brands.length > 0) {
    if (brands.length === 1) {
      criteria.push(`All ${brands[0]}s`)
    } else {
      criteria.push(`${brands.slice(0, -1).join(', ')} & ${brands[brands.length - 1]}`)
    }
  }
  
  if (models.length > 0) {
    if (models.length <= 3) {
      criteria.push(models.join(', '))
    } else {
      criteria.push(`${models.slice(0, 2).join(', ')} + ${models.length - 2} more`)
    }
  }
  
  if (types.length > 0) {
    if (types.length <= 2) {
      criteria.push(`All ${types.join(' & ')}s`)
    } else {
      criteria.push(`${types.slice(0, 2).join(', ')} + ${types.length - 2} more types`)
    }
  }
  
  if (criteria.length === 0) return 'All cars welcome'
  
  return criteria.join(' • ')
}

// Get days until trip
export const getDaysUntilTrip = (departureDate) => {
  const departure = new Date(departureDate)
  const now = new Date()
  const diffTime = departure - now
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'Trip completed'
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  return `${diffDays} days`
}

// Sort trips by departure date
export const sortTripsByDate = (trips) => {
  return [...trips].sort((a, b) => new Date(a.departureDate) - new Date(b.departureDate))
}

// Filter trips by search query
export const filterTripsBySearch = (trips, query) => {
  if (!query) return trips
  
  const lowercaseQuery = query.toLowerCase()
  
  return trips.filter(trip => 
    trip.title.toLowerCase().includes(lowercaseQuery) ||
    trip.destination.toLowerCase().includes(lowercaseQuery) ||
    trip.description.toLowerCase().includes(lowercaseQuery) ||
    trip.organizer.toLowerCase().includes(lowercaseQuery)
  )
}