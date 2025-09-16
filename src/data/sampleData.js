// Test credentials for easy login
export const testCredentials = {
  // Free tier user
  'free@test.com': { password: 'test123', userId: '2' },
  // Premium monthly user  
  'premium@test.com': { password: 'test123', userId: '3' },
  // Premium yearly user
  'yearly@test.com': { password: 'test123', userId: '1' },
  // Admin user
  'admin@roadtrip.com': { password: 'admin123', userId: 'admin', role: 'admin' }
}

// Sample users for demo purposes
export const sampleUsers = [
  {
    id: '1',
    name: 'Alex Rodriguez',
    phone: '+1234567890',
    carBrand: 'Audi',
    carModel: 'Q5',
    carVariant: 'SQ5',
    carType: 'SUV',
    photos: ['/car-photos/audi-sq5-1.jpg', '/car-photos/audi-sq5-2.jpg'],
    tier: 'premium_yearly',
    stats: {
      tripsCreated: 12,
      tripsJoined: 8,
      points: 450,
      monthlyTrips: 2,
      notificationsReceived: 5
    },
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Sarah Chen',
    phone: '+1987654321',
    carBrand: 'BMW',
    carModel: '3 Series',
    carVariant: 'M3',
    carType: 'Sports Car',
    photos: ['/car-photos/bmw-m3-1.jpg', '/car-photos/bmw-m3-2.jpg'],
    tier: 'free',
    stats: {
      tripsCreated: 1,
      tripsJoined: 5,
      points: 120,
      monthlyTrips: 1,
      notificationsReceived: 2
    },
    createdAt: '2024-02-20T14:15:00Z'
  },
  {
    id: '3',
    name: 'Michael Johnson',
    phone: '+1555666777',
    carBrand: 'Toyota',
    carModel: 'Supra',
    carVariant: 'Supra 3.0 Premium',
    carType: 'Sports Car',
    photos: ['/car-photos/toyota-supra-1.jpg', '/car-photos/toyota-supra-2.jpg'],
    tier: 'premium_monthly',
    stats: {
      tripsCreated: 6,
      tripsJoined: 15,
      points: 380,
      monthlyTrips: 0,
      notificationsReceived: 8
    },
    createdAt: '2024-01-08T09:45:00Z'
  },
  {
    id: '4',
    name: 'Emily Davis',
    phone: '+1444555666',
    carBrand: 'Ford',
    carModel: 'Mustang',
    carVariant: 'Mustang GT',
    carType: 'Sports Car',
    photos: ['/car-photos/ford-mustang-1.jpg', '/car-photos/ford-mustang-2.jpg'],
    tier: 'free',
    stats: {
      tripsCreated: 0,
      tripsJoined: 3,
      points: 75,
      monthlyTrips: 0,
      notificationsReceived: 1
    },
    createdAt: '2024-03-05T16:20:00Z'
  },
  {
    id: '5',
    name: 'David Martinez',
    phone: '+1333444555',
    carBrand: 'Mercedes',
    carModel: 'AMG GT',
    carVariant: 'AMG GT 63 S',
    carType: 'Sports Car',
    photos: ['/car-photos/mercedes-amg-1.jpg', '/car-photos/mercedes-amg-2.jpg'],
    tier: 'premium_yearly',
    stats: {
      tripsCreated: 8,
      tripsJoined: 12,
      points: 520,
      monthlyTrips: 1,
      notificationsReceived: 6
    },
    createdAt: '2023-12-10T11:00:00Z'
  },
  {
    id: '6',
    name: 'Jessica Wilson',
    phone: '+1222333444',
    carBrand: 'Honda',
    carModel: 'Civic',
    carVariant: 'Civic Type R',
    carType: 'Hatchback',
    photos: ['/car-photos/honda-civic-1.jpg', '/car-photos/honda-civic-2.jpg'],
    tier: 'premium_monthly',
    stats: {
      tripsCreated: 4,
      tripsJoined: 7,
      points: 290,
      monthlyTrips: 1,
      notificationsReceived: 4
    },
    createdAt: '2024-02-14T13:30:00Z'
  },
  {
    id: 'admin',
    name: 'Admin User',
    phone: '+1111111111',
    carBrand: 'Tesla',
    carModel: 'Model S',
    carVariant: 'Model S Plaid',
    carType: 'Electric',
    photos: ['/car-photos/tesla-model-s-1.jpg'],
    tier: 'admin',
    stats: {
      tripsCreated: 0,
      tripsJoined: 0,
      points: 1000,
      monthlyTrips: 0,
      notificationsReceived: 0
    },
    createdAt: '2024-01-01T00:00:00Z'
  }
]

// Sample trips for demo purposes
export const sampleTrips = [
  {
    id: '1',
    organizerId: '1',
    organizer: 'Alex Rodriguez',
    title: 'Pacific Coast Highway Adventure',
    destination: 'Big Sur, California',
    departureDate: '2024-04-15T08:00:00Z',
    meetingPoint: 'Golden Gate Bridge, San Francisco, CA',
    description: 'Join us for an epic drive along the most scenic coastal route in America! We\'ll stop at Monterey and Carmel for lunch and photos.',
    eligibleCars: {
      brands: ['Audi'],
      models: ['Q5', 'SQ5'],
      types: []
    },
    participants: ['1', '2', '3'],
    maxCapacity: 30,
    status: 'open',
    createdAt: '2024-03-20T15:30:00Z'
  },
  {
    id: '2',
    organizerId: '3',
    organizer: 'Michael Johnson',
    title: 'German Sports Car Meet',
    destination: 'Nürburgring Experience Center',
    departureDate: '2024-05-01T06:00:00Z',
    meetingPoint: 'BMW Welt, Munich, Germany',
    description: 'Calling all German sports car owners! Let\'s drive to the legendary Nürburgring and experience the Green Hell together.',
    eligibleCars: {
      brands: ['BMW', 'Audi', 'Mercedes'],
      models: [],
      types: ['Sports Car']
    },
    participants: ['3', '5'],
    maxCapacity: 30,
    status: 'open',
    createdAt: '2024-03-18T12:15:00Z'
  },
  {
    id: '3',
    organizerId: '5',
    organizer: 'David Martinez',
    title: 'Mountain Pass Challenge',
    destination: 'Mount Washington, New Hampshire',
    departureDate: '2024-04-22T07:30:00Z',
    meetingPoint: 'White Mountain Motor Lodge, North Conway, NH',
    description: 'Test your driving skills on one of America\'s most challenging mountain passes. Perfect for sports cars and performance vehicles.',
    eligibleCars: {
      brands: [],
      models: [],
      types: ['Sports Car', 'Coupe']
    },
    participants: ['5', '4', '6'],
    maxCapacity: 30,
    status: 'open',
    createdAt: '2024-03-22T10:45:00Z'
  },
  {
    id: '4',
    organizerId: '2',
    organizer: 'Sarah Chen',
    title: 'City Cruise & Coffee',
    destination: 'Central Park, New York City',
    departureDate: '2024-04-08T09:00:00Z',
    meetingPoint: 'Times Square, New York, NY',
    description: 'Casual morning cruise through NYC followed by coffee and car talk. All car enthusiasts welcome!',
    eligibleCars: {
      brands: [],
      models: [],
      types: ['Sedan', 'SUV', 'Hatchback', 'Sports Car', 'Coupe']
    },
    participants: ['2', '6'],
    maxCapacity: 30,
    status: 'open',
    createdAt: '2024-03-25T14:20:00Z'
  },
  {
    id: '5',
    organizerId: '6',
    organizer: 'Jessica Wilson',
    title: 'Hot Hatch Rally',
    destination: 'Tail of the Dragon, Tennessee',
    departureDate: '2024-05-15T08:00:00Z',
    meetingPoint: 'Smoky Mountain Harley-Davidson, Maryville, TN',
    description: 'Hatchback owners unite! Let\'s tackle the famous 318 curves of Deal\'s Gap. Bring your A-game and your best hot hatch!',
    eligibleCars: {
      brands: [],
      models: [],
      types: ['Hatchback']
    },
    participants: ['6'],
    maxCapacity: 30,
    status: 'open',
    createdAt: '2024-03-28T16:10:00Z'
  }
]

// Helper function to get user by ID
export const getUserById = (id) => {
  return sampleUsers.find(user => user.id === id)
}

// Helper function to get trips by user eligibility
export const getEligibleTrips = (user) => {
  return sampleTrips.filter(trip => {
    const { brands, models, types } = trip.eligibleCars
    
    // Check if user's car matches any of the criteria
    const matchesBrand = brands.length === 0 || brands.includes(user.carBrand)
    const matchesModel = models.length === 0 || models.includes(user.carVariant)
    const matchesType = types.length === 0 || types.includes(user.carType)
    
    // User is eligible if they match at least one criteria when that criteria is specified
    return matchesBrand && matchesModel && matchesType
  })
}

// Sample notifications
export const sampleNotifications = [
  {
    id: '1',
    userId: '2',
    type: 'trip_invite',
    title: 'New Trip Available!',
    message: 'A new Pacific Coast Highway trip is available for BMW owners',
    tripId: '2',
    read: false,
    createdAt: '2024-03-28T10:00:00Z'
  },
  {
    id: '2', 
    userId: '2',
    type: 'trip_joined',
    title: 'Someone joined your trip!',
    message: 'Michael Johnson joined your Mountain Pass Challenge',
    tripId: '3',
    read: false,
    createdAt: '2024-03-27T15:30:00Z'
  },
  {
    id: '3',
    userId: '3',
    type: 'trip_reminder',
    title: 'Trip reminder',
    message: 'German Sports Car Meet starts in 24 hours!',
    tripId: '2',
    read: true,
    createdAt: '2024-03-26T09:00:00Z'
  }
]

// Helper function to check if user can join a specific trip
export const canUserJoinTrip = (user, trip) => {
  if (trip.participants.includes(user.id)) return false // Already joined
  if (trip.participants.length >= trip.maxCapacity) return false // Trip is full
  
  const { brands, models, types } = trip.eligibleCars
  
  // Check eligibility
  const matchesBrand = brands.length === 0 || brands.includes(user.carBrand)
  const matchesModel = models.length === 0 || models.includes(user.carVariant)
  const matchesType = types.length === 0 || types.includes(user.carType)
  
  return matchesBrand && matchesModel && matchesType
}

// Helper function to get notifications for user
export const getUserNotifications = (userId) => {
  return sampleNotifications.filter(notification => notification.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}