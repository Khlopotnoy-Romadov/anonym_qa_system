import { createStore } from 'vuex'
import axios from 'axios'

// Настройка axios
axios.defaults.baseURL = 'http://127.0.0.1:8000'
axios.defaults.headers.common['Accept'] = 'application/json'
axios.defaults.headers.common['Content-Type'] = 'application/json'

export default createStore({
    state: {
        user: null,
        isAuthenticated: false,
        token: null
    },
    mutations: {
        SET_USER(state, user) {
            state.user = user
            state.isAuthenticated = !!user
            if (user) {
                localStorage.setItem('user', JSON.stringify(user))
            } else {
                localStorage.removeItem('user')
                localStorage.removeItem('token')
            }
        },
        SET_TOKEN(state, token) {
            state.token = token
            if (token) {
                localStorage.setItem('token', token)
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            } else {
                delete axios.defaults.headers.common['Authorization']
            }
        }
    },
    actions: {
        async register({ commit }, userData) {
            try {
                const response = await axios.post('/api/register', userData)
                if (response.data.success) {
                    commit('SET_USER', response.data.user)
                    return { success: true, data: response.data }
                } else {
                    throw new Error(response.data.message)
                }
            } catch (error) {
                console.error('Registration error:', error)
                throw error
            }
        },
        
        async login({ commit }, credentials) {
            try {
                const response = await axios.post('/api/login', credentials)
                console.log('Login response:', response.data)
                
                if (response.data.success) {
                    commit('SET_USER', response.data.user)
                    if (response.data.token) {
                        commit('SET_TOKEN', response.data.token)
                    }
                    return { success: true, data: response.data }
                } else {
                    return { success: false, message: response.data.message }
                }
            } catch (error) {
                console.error('Login error:', error)
                return { success: false, message: error.response?.data?.message || error.message }
            }
        },
        
        async logout({ commit }) {
            try {
                await axios.post('/api/logout')
            } catch (error) {
                console.error('Logout error:', error)
            } finally {
                commit('SET_USER', null)
                commit('SET_TOKEN', null)
            }
        },
        
        checkAuth({ commit }) {
            const user = localStorage.getItem('user')
            const token = localStorage.getItem('token')
            if (user) {
                commit('SET_USER', JSON.parse(user))
            }
            if (token) {
                commit('SET_TOKEN', token)
            }
        }
    }
})