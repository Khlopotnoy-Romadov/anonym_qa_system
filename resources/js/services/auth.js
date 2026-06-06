import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

export const auth = {
  async register(data) {
    try {
      const response = await api.post('/register', data)
      console.log('Register success:', response.data)
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      return { success: true, ...response.data }
    } catch (error) {
      console.error('Registration error FULL:', error)
      console.error('Error response:', error.response)
      console.error('Error data:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      if (error.response?.status === 422) {
        return {
          success: false,
          message: error.response.data.message || 'Validation failed',
          errors: error.response.data.errors || {}
        }
      }
      
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
        errors: {}
      }
    }
  },
  
  async login(credentials) {
    try {
      const response = await api.post('/login', credentials)
      if (response.data.token) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      return { success: true, ...response.data }
    } catch (error) {
      console.error('Login error:', error.response?.data)
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      }
    }
  },
  
  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
  
  isAuthenticated() {
    return !!localStorage.getItem('token')
  },
  
  getUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }
}