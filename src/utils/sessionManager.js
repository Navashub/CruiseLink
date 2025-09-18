import { authAPI } from '../services'

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT = 30 * 60 * 1000

class SessionManager {
  constructor() {
    this.timeoutId = null
    this.warningTimeoutId = null
    this.onLogout = null
    this.onWarning = null
    this.lastActivity = Date.now()
  }

  // Initialize session manager
  init(onLogout, onWarning = null) {
    this.onLogout = onLogout
    this.onWarning = onWarning
    this.resetTimeout()
    this.setupActivityListeners()
  }

  // Reset the session timeout
  resetTimeout() {
    this.clearTimeouts()
    this.lastActivity = Date.now()

    // Set warning timeout (5 minutes before session expires)
    if (this.onWarning) {
      this.warningTimeoutId = setTimeout(() => {
        this.onWarning()
      }, SESSION_TIMEOUT - 5 * 60 * 1000)
    }

    // Set session timeout
    this.timeoutId = setTimeout(() => {
      this.handleSessionTimeout()
    }, SESSION_TIMEOUT)
  }

  // Clear all timeouts
  clearTimeouts() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
    if (this.warningTimeoutId) {
      clearTimeout(this.warningTimeoutId)
      this.warningTimeoutId = null
    }
  }

  // Handle session timeout
  handleSessionTimeout() {
    console.log('Session expired due to inactivity')
    this.logout()
  }

  // Manual logout
  logout() {
    this.clearTimeouts()
    this.removeActivityListeners()
    
    // Clear stored token and user data
    authAPI.removeToken()
    localStorage.removeItem('user')
    
    if (this.onLogout) {
      this.onLogout()
    }
  }

  // Setup activity listeners
  setupActivityListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    events.forEach(event => {
      document.addEventListener(event, this.handleActivity, true)
    })

    // Listen for API responses that might indicate invalid token
    this.setupAPIResponseInterceptor()
  }

  // Remove activity listeners
  removeActivityListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    events.forEach(event => {
      document.removeEventListener(event, this.handleActivity, true)
    })
  }

  // Handle user activity
  handleActivity = () => {
    const now = Date.now()
    
    // Only reset timeout if it's been more than 1 minute since last activity
    // This prevents too frequent timeout resets
    if (now - this.lastActivity > 60000) {
      this.resetTimeout()
    }
  }

  // Setup API response interceptor to catch 401 errors
  setupAPIResponseInterceptor() {
    const originalFetch = window.fetch
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args)
        
        // Check for 401 Unauthorized responses
        if (response.status === 401) {
          console.log('Received 401 response, session may be invalid')
          this.handleInvalidSession()
        }
        
        return response
      } catch (error) {
        throw error
      }
    }
  }

  // Handle invalid session from API
  handleInvalidSession() {
    console.log('Session invalidated by server')
    this.logout()
  }

  // Check if session is still valid
  async validateSession() {
    try {
      const token = authAPI.getToken()
      if (!token) {
        this.logout()
        return false
      }

      // Try to validate token with server
      await authAPI.getProfile()
      return true
    } catch (error) {
      console.log('Session validation failed:', error)
      this.logout()
      return false
    }
  }

  // Get remaining session time
  getRemainingTime() {
    return Math.max(0, SESSION_TIMEOUT - (Date.now() - this.lastActivity))
  }

  // Format remaining time for display
  formatRemainingTime() {
    const remaining = this.getRemainingTime()
    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Destroy session manager
  destroy() {
    this.clearTimeouts()
    this.removeActivityListeners()
    this.onLogout = null
    this.onWarning = null
  }
}

// Create singleton instance
const sessionManager = new SessionManager()

export default sessionManager