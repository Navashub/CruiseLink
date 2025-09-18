import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { testCredentials, sampleUsers } from '../../data/sampleData'

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState([])
  const [isLoading, setIsLoading] = useState(false)

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors([])

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))

    // Check credentials
    const credentials = testCredentials[formData.email.toLowerCase()]
    
    if (!credentials || credentials.password !== formData.password) {
      setErrors(['Invalid email or password'])
      setIsLoading(false)
      return
    }

    // Find user data
    const user = sampleUsers.find(u => u.id === credentials.userId)
    
    if (!user) {
      setErrors(['User not found'])
      setIsLoading(false)
      return
    }

    // Add role if admin
    const userData = credentials.role === 'admin' 
      ? { ...user, role: 'admin' }
      : user

    onLogin(userData)
    navigate('/')
    setIsLoading(false)
  }

  const quickLogin = (email, password) => {
    setFormData({ email, password })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold text-blue-600">RoadTrip Convoy</h1>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
          <p className="text-gray-600">Sign in to your account to continue your adventures</p>
        </div>

        {/* Test Accounts Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-3">🧪 Test Accounts</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Free User:</span>
              <button 
                onClick={() => quickLogin('free@test.com', 'test123')}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                free@test.com
              </button>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Premium User:</span>
              <button 
                onClick={() => quickLogin('premium@test.com', 'test123')}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                premium@test.com
              </button>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Yearly User:</span>
              <button 
                onClick={() => quickLogin('yearly@test.com', 'test123')}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                yearly@test.com
              </button>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Admin:</span>
              <button 
                onClick={() => quickLogin('admin@roadtrip.com', 'admin123')}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                admin@roadtrip.com
              </button>
            </div>
            <p className="text-blue-600 text-xs mt-2">Click any email to auto-fill (password: test123 / admin123)</p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          {/* Error Display */}
          {errors.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <ul className="text-red-600 text-sm space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Signing In...
              </>
            ) : (
              '🚗 Sign In'
            )}
          </button>

          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                Sign up here
              </Link>
            </p>
          </div>
        </form>

        {/* Back to Landing */}
        <div className="text-center">
          <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage