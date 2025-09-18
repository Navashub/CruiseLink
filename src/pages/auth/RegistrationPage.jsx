import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI, carsAPI } from '../../services'

const RegistrationPage = ({ onRegister }) => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirm: '',
    car_brand: '',
    car_model: '',
    car_variant: '',
    car_type: '',
    photos: [],
    tier: 'free'
  })
  const [carData, setCarData] = useState({
    brands: [],
    models: [],
    variants: [],
    types: []
  })
  const [errors, setErrors] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load car data on component mount
  useEffect(() => {
    const loadCarData = async () => {
      try {
        const [brands, types] = await Promise.all([
          carsAPI.getBrands(),
          carsAPI.getCarTypes()
        ])
        setCarData(prev => ({
          ...prev,
          brands: brands,
          types: types
        }))
      } catch (error) {
        console.error('Failed to load car data:', error)
        setErrors(['Failed to load car data. Please refresh the page.'])
      } finally {
        setLoading(false)
      }
    }

    loadCarData()
  }, [])

  // Load models when brand changes
  useEffect(() => {
    if (formData.car_brand) {
      const loadModels = async () => {
        try {
          const models = await carsAPI.getModels(formData.car_brand)
          setCarData(prev => ({
            ...prev,
            models: models,
            variants: []
          }))
        } catch (error) {
          console.error('Failed to load models:', error)
        }
      }
      loadModels()
    }
  }, [formData.car_brand])

  // Load variants when model changes
  useEffect(() => {
    if (formData.car_model) {
      const loadVariants = async () => {
        try {
          const variants = await carsAPI.getVariants(formData.car_model)
          setCarData(prev => ({
            ...prev,
            variants: variants
          }))
        } catch (error) {
          console.error('Failed to load variants:', error)
        }
      }
      loadVariants()
    }
  }, [formData.car_model])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset dependent fields when parent changes
      ...(name === 'car_brand' && { car_model: '', car_variant: '' }),
      ...(name === 'car_model' && { car_variant: '' })
    }))
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files)
    console.log('Debug: New files uploaded:', files.map(f => f.name))
    if (files.length + formData.photos.length > 5) {
      setErrors(['You can upload maximum 5 photos'])
      return
    }
    
    // Store actual files for API submission
    const newPhotos = files.map(file => {
      console.log('Debug: Processing file:', file.name, file.constructor.name, file instanceof File)
      return {
        id: Date.now() + Math.random(),
        name: file.name,
        url: URL.createObjectURL(file),
        file
      }
    })
    
    console.log('Debug: New photos array:', newPhotos)
    
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos]
    }))
    setErrors([])
  }

  const removePhoto = (photoId) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter(p => p.id !== photoId)
    }))
  }

  // Validation functions
  const validateStep = (step) => {
    switch (step) {
      case 1:
        const errors = []
        if (!formData.name.trim()) errors.push('Name is required')
        if (!formData.email.trim()) errors.push('Email is required')
        if (!formData.phone.trim()) errors.push('Phone number is required')
        if (!formData.password.trim()) errors.push('Password is required')
        if (!formData.password_confirm.trim()) errors.push('Password confirmation is required')
        if (formData.password !== formData.password_confirm) errors.push('Passwords do not match')
        return errors
      case 2:
        const step2errors = []
        if (!formData.car_brand) step2errors.push('Car brand is required')
        if (!formData.car_model) step2errors.push('Car model is required')
        if (!formData.car_variant) step2errors.push('Car variant is required')
        if (!formData.car_type) step2errors.push('Car type is required')
        return step2errors
      case 3:
        if (formData.photos.length < 2) return ['Please upload at least 2 photos of your car']
        if (formData.photos.length > 5) return ['Maximum 5 photos allowed']
        return []
      case 4:
        // Final validation - check all steps
        const allErrors = [
          ...validateStep(1),
          ...validateStep(2), 
          ...validateStep(3)
        ]
        return allErrors
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
    setIsSubmitting(true)
    
    // Final validation
    const stepErrors = validateStep(4)
    if (stepErrors.length > 0) {
      setErrors(stepErrors)
      setIsSubmitting(false)
      return
    }

    try {
      // Prepare data for API
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        password_confirm: formData.password_confirm,
        car_brand: formData.car_brand,
        car_model: formData.car_model,
        car_variant: formData.car_variant,
        car_type: formData.car_type,
        tier: formData.tier
      }
      
      // Extract actual files for upload - ensure all are valid File objects
      const photoFiles = formData.photos
        .map(photo => photo.file)
        .filter(file => file instanceof File && file.size > 0 && file.type.startsWith('image/'))
      
      // Final validation check before API call
      if (photoFiles.length < 2) {
        setErrors(['Please upload at least 2 photos of your car'])
        setIsSubmitting(false)
        return
      }
      
      // Call registration API
      const response = await authAPI.register(userData, photoFiles)
      
      // Handle successful registration
      onRegister(response.user, response.token)
      navigate('/')
    } catch (error) {
      console.error('Registration error:', error)
      
      // Handle different types of errors
      let errorMessages = []
      
      if (error.status === 400 && error.details) {
        // Extract validation errors from Django REST framework response
        Object.keys(error.details).forEach(field => {
          const fieldErrors = Array.isArray(error.details[field]) 
            ? error.details[field] 
            : [error.details[field]]
          fieldErrors.forEach(msg => {
            // Better formatting for field errors
            const fieldName = field === 'car_brand' ? 'Car Brand' :
                            field === 'car_model' ? 'Car Model' :
                            field === 'car_variant' ? 'Car Variant' :
                            field === 'car_type' ? 'Car Type' :
                            field === 'password_confirm' ? 'Password Confirmation' :
                            field.charAt(0).toUpperCase() + field.slice(1)
            
            // Convert object errors to string
            const errorMsg = typeof msg === 'object' ? JSON.stringify(msg) : msg
            errorMessages.push(`${fieldName}: ${errorMsg}`)
          })
        })
      }
      
      // Fall back to general error message if no specific errors found
      if (errorMessages.length === 0) {
        errorMessages = [error.message || 'Registration failed. Please try again.']
      }
      
      setErrors(errorMessages)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading registration form...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold text-blue-600">RoadTrip Convoy</h1>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Join Our Community</h2>
          <p className="text-gray-600">Register your car and start your adventure</p>
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
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">👤</div>
                <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                <p className="text-gray-600">Let's get to know you</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Create a secure password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="password_confirm"
                  value={formData.password_confirm}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm your password"
                />
              </div>
            </div>
          )}

          {/* Step 2: Car Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">🚗</div>
                <h3 className="text-xl font-bold text-gray-900">Your Car Details</h3>
                <p className="text-gray-600">Tell us about your ride</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Car Brand *
                  </label>
                  <select
                    name="car_brand"
                    value={formData.car_brand}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Brand</option>
                    {carData.brands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Car Model *
                  </label>
                  <select
                    name="car_model"
                    value={formData.car_model}
                    onChange={handleInputChange}
                    disabled={!formData.car_brand}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Select Model</option>
                    {carData.models.map(model => (
                      <option key={model.id} value={model.id}>{model.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specific Variant *
                  </label>
                  <select
                    name="car_variant"
                    value={formData.car_variant}
                    onChange={handleInputChange}
                    disabled={!formData.car_model}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Select Variant</option>
                    {carData.variants.map(variant => (
                      <option key={variant.id} value={variant.id}>{variant.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Car Type *
                  </label>
                  <select
                    name="car_type"
                    value={formData.car_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Type</option>
                    {carData.types.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Car Photos */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">📸</div>
                <h3 className="text-xl font-bold text-gray-900">Car Photos</h3>
                <p className="text-gray-600">Upload at least 2 photos (exterior & interior)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Photos * (2-5 photos)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <span className="mr-2">📷</span>
                    Choose Photos
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    JPG, PNG up to 10MB each
                  </p>
                </div>
              </div>

              {/* Photo Preview */}
              {formData.photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.photos.map(photo => (
                    <div key={photo.id} className="relative">
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">✅</div>
                <h3 className="text-xl font-bold text-gray-900">Review & Submit</h3>
                <p className="text-gray-600">Confirm your details</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="ml-2 text-gray-900">{formData.name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <span className="ml-2 text-gray-900">{formData.phone}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Car:</span>
                  <span className="ml-2 text-gray-900">
                    {formData.carBrand} {formData.carVariant} ({formData.carType})
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Photos:</span>
                  <span className="ml-2 text-gray-900">{formData.photos.length} uploaded</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">🎉 Welcome Bonus!</h4>
                <p className="text-blue-700 text-sm">
                  You'll start with 25 points for completing car verification. 
                  You're starting with a Free tier account - upgrade anytime for unlimited features!
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 mt-6 border-t">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            )}
            
            <div className="ml-auto">
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="inline-block animate-spin mr-2">⏳</span>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      🚀 Join RoadTrip Convoy
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Back to Landing */}
        <div className="text-center mt-6">
          <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RegistrationPage