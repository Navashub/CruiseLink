import { useState } from 'react'
import { Link } from 'react-router-dom'

const LandingPage = () => {
  return (
    <div className="min-h-screen gradient-automotive">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              RoadTrip
              <span className="block text-yellow-300">Convoy</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Connect with car enthusiasts and organize epic road trips with compatible vehicles. 
              Find your perfect convoy partners today!
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Link
                to="/register"
                className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 hover-lift block sm:inline-block"
              >
                🚗 Join the Adventure
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto bg-transparent border-2 border-white hover:bg-white hover:text-blue-900 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 block sm:inline-block"
              >
                Sign In
              </Link>
              <button
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto bg-transparent border-2 border-white hover:bg-white hover:text-blue-900 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 block sm:inline-block"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Floating Car Icons */}
        <div className="absolute top-20 left-10 text-6xl opacity-30 animate-bounce">🏎️</div>
        <div className="absolute top-40 right-20 text-4xl opacity-40 animate-pulse">🚙</div>
        <div className="absolute bottom-20 left-1/4 text-5xl opacity-35 animate-bounce delay-1000">🚗</div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose RoadTrip Convoy?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The smartest way to organize and join road trips with like-minded car enthusiasts
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Smart Matching */}
            <div className="text-center p-8 rounded-xl gradient-card hover-lift">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Car Matching</h3>
              <p className="text-gray-600">
                Connect with owners of compatible vehicles. Create trips for specific brands, 
                models, or car types for the perfect convoy experience.
              </p>
            </div>

            {/* Easy Organization */}
            <div className="text-center p-8 rounded-xl gradient-card hover-lift">
              <div className="text-5xl mb-4">📱</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Easy Organization</h3>
              <p className="text-gray-600">
                Simple trip creation with automatic notifications to eligible car owners. 
                Manage participants and track your convoy with ease.
              </p>
            </div>

            {/* Verified Community */}
            <div className="text-center p-8 rounded-xl gradient-card hover-lift">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Verified Community</h3>
              <p className="text-gray-600">
                All members verify their vehicles with photos. Join a trusted community 
                of real car enthusiasts who share your passion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in just 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Register & Verify</h3>
              <p className="text-gray-600">
                Sign up with your car details and upload photos for verification
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Browse or Create</h3>
              <p className="text-gray-600">
                Find existing trips or create your own with specific car requirements
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Hit the Road</h3>
              <p className="text-gray-600">
                Join your convoy and experience unforgettable adventures together
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600">
              Start free, upgrade when you're ready for more adventures
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="border-2 border-gray-200 rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-4">$0</div>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Join unlimited trips
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  1 trip creation per month
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Basic support
                </li>
              </ul>
            </div>

            {/* Premium Monthly */}
            <div className="border-2 border-blue-500 rounded-xl p-8 text-center relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                POPULAR
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Monthly</h3>
              <div className="text-4xl font-bold text-gray-900 mb-4">$10</div>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Unlimited trip creation
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Unlimited notifications
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Priority support
                </li>
              </ul>
            </div>

            {/* Premium Yearly */}
            <div className="border-2 border-yellow-500 rounded-xl p-8 text-center relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                BEST VALUE
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Yearly</h3>
              <div className="text-4xl font-bold text-gray-900 mb-4">$96</div>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Everything in Premium
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  20% savings
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Advanced features
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-automotive">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of car enthusiasts already planning their next adventure
          </p>
          <Link
            to="/register"
            className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold py-4 px-8 rounded-xl text-xl transition-all duration-300 hover-lift inline-block"
          >
            Get Started Today 🚗
          </Link>
        </div>
      </section>
    </div>
  )
}

export default LandingPage