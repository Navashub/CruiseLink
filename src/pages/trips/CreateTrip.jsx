import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { roadtripsAPI } from '../../services/roadtripsService'
import { carService } from '../../services/carService'
import { validateTripData } from '../../utils/tripUtils'
import { canUserCreateTrip, shouldShowUpgradePrompt } from '../../utils/userUtils'

const CreateTrip = ({ user }) => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    departureDate: '',
    meetingPoint: '',
    description: '',
    maxParticipants: 20,
    estimatedDuration: '',
    estimatedDistance: '',
    difficultyLevel: 'easy',
    eligibleCars: {
      brands: [],
      models: [],
      types: []
    }
  })
  const [errors, setErrors] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  
  // Car data for eligibility selection
  const [carData, setCarData] = useState({
    brands: [],
    models: [],
    types: []
  })
  const [loadingCarData, setLoadingCarData] = useState(true)

  // Check if user can create trip
  const canCreate = canUserCreateTrip(user)
  const needsUpgrade = shouldShowUpgradePrompt(user)

  // Load car data for eligibility selection
  useEffect(() => {
    const loadCarData = async () => {
      try {
        setLoadingCarData(true)
        const [brandsResponse, typesResponse] = await Promise.all([
          carService.getBrandsWithModels(),
          carService.getCarTypes()
        ])
        
        setCarData({
          brands: brandsResponse.data,
          models: [], // Models will be loaded dynamically
          types: typesResponse.data
        })
      } catch (error) {
        console.error('Error loading car data:', error)
        setErrors(['Failed to load car data. Please refresh the page.'])
      } finally {
        setLoadingCarData(false)
      }
    }
    
    loadCarData()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const handleCarSelectionChange = (category, value, checked) => {
    setFormData(prev => ({
      ...prev,
      eligibleCars: {
        ...prev.eligibleCars,
        [category]: checked 
          ? [...prev.eligibleCars[category], value]
          : prev.eligibleCars[category].filter(item => item !== value)
      }
    }))
  }

  const validateStep = (step) => {
    switch (step) {
      case 1:
        const basicErrors = []
        if (!formData.title.trim()) basicErrors.push('Trip title is required')
        if (!formData.destination.trim()) basicErrors.push('Destination is required')
        if (!formData.departureDate) basicErrors.push('Departure date is required')
        if (!formData.meetingPoint.trim()) basicErrors.push('Meeting point is required')
        return basicErrors
      case 2:
        if (!formData.description.trim()) return ['Trip description is required']
        return []
      case 3:
        const { brands, models, types } = formData.eligibleCars
        if (brands.length === 0 && models.length === 0 && types.length === 0) {
          return ['Please select at least one car eligibility criteria']
        }
        return []
      default:
        return []
    }
  }

  const nextStep = () => {
    const stepErrors = validateStep(currentStep)
    if (stepErrors.length > 0) {
      setErrors(stepErrors)
      return
    }
    setErrors([])
    setCurrentStep(prev => prev + 1)
  }

  const prevStep = () => {
    setCurrentStep(prev => prev - 1)
    setErrors([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!canCreate) {
      setShowUpgradeModal(true)
      return
    }

    setIsSubmitting(true)
    
    const validationErrors = validateTripData(formData)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      setIsSubmitting(false)
      return
    }

    try {
      // Prepare trip data for API
      const tripData = {
        title: formData.title,
        destination: formData.destination,
        departure_date: formData.departureDate,
        meeting_point: formData.meetingPoint,
        description: formData.description,
        max_participants: formData.maxParticipants,
        estimated_duration: formData.estimatedDuration,
        estimated_distance: formData.estimatedDistance,
        difficulty_level: formData.difficultyLevel,
        eligibility: {
          eligible_brands: formData.eligibleCars.brands,
          eligible_models: formData.eligibleCars.models,
          eligible_types: formData.eligibleCars.types,
          open_to_all: formData.eligibleCars.brands.length === 0 && 
                      formData.eligibleCars.models.length === 0 && 
                      formData.eligibleCars.types.length === 0
        }
      }
      
      const response = await roadtripsAPI.createTrip(tripData)
      
      // Success - redirect to trip details
      navigate(`/trips/${response.id}`)
    } catch (error) {
      console.error('Error creating trip:', error)
      if (error.response?.data) {
        // Handle API validation errors
        const apiErrors = []
        const errorData = error.response.data
        
        if (typeof errorData === 'object') {
          Object.keys(errorData).forEach(field => {
            if (Array.isArray(errorData[field])) {
              apiErrors.push(...errorData[field])
            } else if (typeof errorData[field] === 'string') {
              apiErrors.push(errorData[field])
            }
          })
        }
        
        setErrors(apiErrors.length > 0 ? apiErrors : ['Failed to create trip. Please try again.'])
      } else {
        setErrors(['Failed to create trip. Please check your connection and try again.'])
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const UpgradeModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-8 max-w-md w-full">
        <div className="text-center">
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Upgrade to Premium</h3>
          <p className="text-gray-600 mb-6">
            You've reached your monthly trip limit. Upgrade to Premium for unlimited trip creation!
          </p>
          
          <div className="space-y-3">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium">
              Upgrade to Premium Monthly - $10/month
            </button>
            <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded-lg font-medium">
              Upgrade to Premium Yearly - $96/year (20% off!)
            </button>
          </div>
          
          <button 
            onClick={() => setShowUpgradeModal(false)}
            className="mt-4 text-gray-500 hover:text-gray-700"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )

  if (!canCreate && !showUpgradeModal) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Trip Creation Limit Reached</h2>
            <p className="text-gray-600 mb-6">
              You've created {user.stats.monthlyTrips} trip(s) this month. Free users can create 1 trip per month.
            </p>
            
            <div className="space-y-4">
              <button 
                onClick={() => setShowUpgradeModal(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
              >
                🚀 Upgrade to Premium
              </button>
              <Link 
                to="/trips"
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium"
              >
                Browse Existing Trips
              </Link>
            </div>
          </div>
        </div>
        {showUpgradeModal && <UpgradeModal />}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Epic Road Trip</h1>
          <p className="text-gray-600">Organize your perfect convoy adventure</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Step {currentStep} of 4</span>
            <span className="text-sm font-medium text-gray-500">{Math.round((currentStep / 4) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Error Display */}
        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <ul className="text-red-600 text-sm space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          {/* Step 1: Basic Trip Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">🗺️</div>
                <h3 className="text-xl font-bold text-gray-900">Trip Details</h3>
                <p className="text-gray-600">Where are we going?</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trip Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Pacific Coast Highway Adventure"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination *
                  </label>
                  <input
                    type="text"
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Big Sur, California"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departure Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="departureDate"
                    value={formData.departureDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min={new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be at least 3 days in advance</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Point *
                  </label>
                  <input
                    type="text"
                    name="meetingPoint"
                    value={formData.meetingPoint}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Golden Gate Bridge, San Francisco"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    min="1"
                    max="50"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Duration
                  </label>
                  <input
                    type="text"
                    name="estimatedDuration"
                    value={formData.estimatedDuration}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 2 days, 6 hours"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Distance
                  </label>
                  <input
                    type="text"
                    name="estimatedDistance"
                    value={formData.estimatedDistance}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 500 miles, 800 km"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  name="difficultyLevel"
                  value={formData.difficultyLevel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="easy">Easy - Relaxed pace, good roads</option>
                  <option value="moderate">Moderate - Some challenging sections</option>
                  <option value="challenging">Challenging - Difficult roads, experienced drivers</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Description */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">📝</div>
                <h3 className="text-xl font-bold text-gray-900">Trip Description</h3>
                <p className="text-gray-600">Tell everyone what makes this trip special</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your trip... What will you see? What's the route? Any special stops or activities?"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Be detailed! This helps other car enthusiasts decide if they want to join your adventure.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips for Great Trip Descriptions</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Mention scenic routes and photo opportunities</li>
                  <li>• Include planned stops for food, fuel, or sightseeing</li>
                  <li>• Specify the driving style (leisurely cruise vs spirited driving)</li>
                  <li>• Note any special events or meetups along the way</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 3: Car Selection */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">🚗</div>
                <h3 className="text-xl font-bold text-gray-900">Who Can Join?</h3>
                <p className="text-gray-600">Select which cars are eligible for this trip</p>
              </div>

              {loadingCarData ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading car data...</p>
                </div>
              ) : (
                <>
                  {/* Brands */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">By Brand</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {carData.brands.map(brand => (
                        <label key={brand.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.eligibleCars.brands.includes(brand.id)}
                            onChange={(e) => handleCarSelectionChange('brands', brand.id, e.target.checked)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium">{brand.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Specific Models */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Specific Models</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {carData.brands.map(brand => 
                        brand.models?.map(model => (
                          <label key={model.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.eligibleCars.models.includes(model.id)}
                              onChange={(e) => handleCarSelectionChange('models', model.id, e.target.checked)}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs font-medium">{brand.name} {model.name}</span>
                          </label>
                        )) || []
                      )}
                    </div>
                  </div>

                  {/* Car Types */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">By Type</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {carData.types.map(type => (
                        <label key={type.id} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.eligibleCars.types.includes(type.id)}
                            onChange={(e) => handleCarSelectionChange('types', type.id, e.target.checked)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium">{type.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <span className="font-medium">Note:</span> Users will be eligible if their car matches ANY of the selected criteria.
                  For example, selecting "BMW" and "Sports Car" means both BMW owners AND sports car owners can join.
                  If no criteria are selected, the trip will be open to all cars.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">✅</div>
                <h3 className="text-xl font-bold text-gray-900">Review & Create</h3>
                <p className="text-gray-600">Everything look good?</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700">Trip Title</h4>
                  <p className="text-gray-900">{formData.title}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Destination</h4>
                  <p className="text-gray-900">{formData.destination}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Departure</h4>
                  <p className="text-gray-900">
                    {formData.departureDate ? new Date(formData.departureDate).toLocaleString() : 'Not set'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Meeting Point</h4>
                  <p className="text-gray-900">{formData.meetingPoint}</p>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700">Max Participants</h4>
                    <p className="text-gray-900">{formData.maxParticipants}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Difficulty</h4>
                    <p className="text-gray-900 capitalize">{formData.difficultyLevel}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">Duration</h4>
                    <p className="text-gray-900">{formData.estimatedDuration || 'Not specified'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Eligible Cars</h4>
                  <p className="text-gray-900">
                    {(() => {
                      const eligibleItems = []
                      
                      // Add selected brands
                      const selectedBrands = carData.brands.filter(brand => 
                        formData.eligibleCars.brands.includes(brand.id)
                      ).map(brand => brand.name)
                      eligibleItems.push(...selectedBrands)
                      
                      // Add selected models
                      const selectedModels = []
                      carData.brands.forEach(brand => {
                        brand.models?.forEach(model => {
                          if (formData.eligibleCars.models.includes(model.id)) {
                            selectedModels.push(`${brand.name} ${model.name}`)
                          }
                        })
                      })
                      eligibleItems.push(...selectedModels)
                      
                      // Add selected types
                      const selectedTypes = carData.types.filter(type => 
                        formData.eligibleCars.types.includes(type.id)
                      ).map(type => type.name)
                      eligibleItems.push(...selectedTypes)
                      
                      return eligibleItems.length > 0 ? eligibleItems.join(', ') : 'All cars welcome'
                    })()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 mt-6 border-t">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Previous
              </button>
            )}
            
            <div className="ml-auto">
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      Creating Trip...
                    </>
                  ) : (
                    '🚀 Create Trip'
                  )}
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Back to Trips */}
        <div className="text-center mt-6">
          <Link to="/trips" className="text-blue-600 hover:text-blue-800 text-sm">
            ← Back to trips
          </Link>
        </div>
      </div>

      {showUpgradeModal && <UpgradeModal />}
    </div>
  )
}

export default CreateTrip