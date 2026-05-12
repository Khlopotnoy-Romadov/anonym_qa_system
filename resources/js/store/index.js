import { createStore } from 'vuex'
import { api } from '../services/api'

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
                localStorage.setItem('qa_current_user', JSON.stringify(user))
            } else {
                localStorage.removeItem('qa_current_user')
                localStorage.removeItem('qa_token')
            }
        },
        SET_TOKEN(state, token) {
            state.token = token
            if (token) {
                localStorage.setItem('qa_token', token)
            } else {
                localStorage.removeItem('qa_token')
            }
        }
    },
    actions: {
        async register({ commit }, userData) {
            try {
                const response = await api.register(userData)
                if (response.data.success) {
                    commit('SET_USER', response.data.user)
                    commit('SET_TOKEN', response.data.token)
                    return { success: true, data: response.data }
                }
            } catch (error) {
                console.error('Registration error:', error)
                throw error
            }
        },
        
        async login({ commit }, credentials) {
            try {
                const response = await api.login(credentials)
                
                if (response.data.success) {
                    commit('SET_USER', response.data.user)
                    commit('SET_TOKEN', response.data.token)
                    return { success: true, data: response.data }
                }
            } catch (error) {
                console.error('Login error:', error)
                return { 
                    success: false, 
                    message: error.response?.data?.message || error.message 
                }
            }
        },
        
        async logout({ commit }) {
            commit('SET_USER', null)
            commit('SET_TOKEN', null)
        },
        
        checkAuth({ commit }) {
            const user = localStorage.getItem('qa_current_user')
            const token = localStorage.getItem('qa_token')
            if (user) {
                commit('SET_USER', JSON.parse(user))
            }
            if (token) {
                commit('SET_TOKEN', token)
            }
        }
    }
})