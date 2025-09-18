import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { carDatabase, carTypes, getAllBrands, getModelsForBrand, getVariantsForModel } from '../../data/carDatabase'
import { validateUserData } from '../../utils/userUtils'

const RegistrationPage = ({ onRegister }) => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    carBrand: '',
    carModel: '',
    carVariant: '',
    carType: '',
    photos: [],
    tier: 'free'
  })
  const [errors, setErrors] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset dependent fields when parent changes
      ...(name === 'carBrand' && { carModel: '', carVariant: '' }),
      ...(name === 'carModel' && { carVariant: '' })
    }))
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + formData.photos.length > 5) {
      setErrors(['You can upload maximum 5 photos'])
      return
    }
    
    // Simulate file upload (in real app, would upload to cloud storage)
    const newPhotos = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      url: URL.createObjectURL(file),
      file
    }))
    
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

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) return ['Name is required']
        if (!formData.phone.trim()) return ['Phone number is required']
        return []
      case 2:
        const errors = []
        if (!formData.carBrand) errors.push('Car brand is required')
        if (!formData.carModel) errors.push('Car model is required')
        if (!formData.carVariant) errors.push('Car variant is required')
        if (!formData.carType) errors.push('Car type is required')
        return errors
      case 3:
        if (formData.photos.length < 2) return ['Please upload at least 2 photos of your car']
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
    setIsSubmitting(true)
    
    // Validate all data
    const validationErrors = validateUserData(formData)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      setIsSubmitting(false)
      return
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Create user object
      const newUser = {
        id: Date.now().toString(),
        name: formData.name,
        phone: formData.phone,
        carBrand: formData.carBrand,
        carModel: formData.carModel,
        carVariant: formData.carVariant,
        carType: formData.carType,
        photos: formData.photos.map(p => p.url),
        tier: formData.tier,
        stats: {
          tripsCreated: 0,
          tripsJoined: 0,
          points: 25, // Verification bonus
          monthlyTrips: 0,
          notificationsReceived: 0
        },
        createdAt: new Date().toISOString()
      }
      
      onRegister(newUser)
      navigate('/')
    } catch (error) {
      setErrors(['Registration failed. Please try again.'])
    } finally {
      setIsSubmitting(false)
    }
  }

  const availableBrands = getAllBrands()
  const availableModels = getModelsForBrand(formData.carBrand)
  const availableVariants = getVariantsForModel(formData.carBrand, formData.carModel)

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
                    name="carBrand"
                    value={formData.carBrand}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Brand</option>
                    {availableBrands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Car Model *
                  </label>
                  <select
                    name="carModel"
                    value={formData.carModel}
                    onChange={handleInputChange}
                    disabled={!formData.carBrand}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Select Model</option>
                    {availableModels.map(model => (
                      <option key={model} value={model}>{model}</option>
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
                    name="carVariant"
                    value={formData.carVariant}
                    onChange={handleInputChange}
                    disabled={!formData.carModel}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Select Variant</option>
                    {availableVariants.map(variant => (
                      <option key={variant} value={variant}>{variant}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Car Type *
                  </label>
                  <select
                    name="carType"
                    value={formData.carType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Type</option>
                    {carTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
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