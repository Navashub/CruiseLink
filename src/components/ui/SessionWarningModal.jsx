import React, { useState, useEffect } from 'react'
import sessionManager from '../../utils/sessionManager'

const SessionWarningModal = ({ isOpen, onExtend, onLogout }) => {
  const [countdown, setCountdown] = useState(300) // 5 minutes in seconds

  useEffect(() => {
    if (!isOpen) return

    const timer = setInterval(() => {
      const remaining = Math.floor(sessionManager.getRemainingTime() / 1000)
      setCountdown(remaining)
      
      if (remaining <= 0) {
        onLogout()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, onLogout])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center">
          <div className="text-4xl mb-4">⏰</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Session Expiring Soon
          </h3>
          <p className="text-gray-600 mb-4">
            Your session will expire in <span className="font-mono font-bold text-red-600">{formatTime(countdown)}</span> due to inactivity.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Click "Stay Logged In" to continue your session, or "Logout" to end your session now.
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={onLogout}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Logout
            </button>
            <button
              onClick={onExtend}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Stay Logged In
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SessionWarningModal