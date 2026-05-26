// resources/js/store/index.js
import { createStore } from 'vuex'
import axios from 'axios' // Добавляем импорт axios
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
                // Удаляем заголовок авторизации при выходе
                delete axios.defaults.headers.common['Authorization']
            }
        },
        SET_TOKEN(state, token) {
            state.token = token
            if (token) {
                localStorage.setItem('qa_token', token)
                // Устанавливаем заголовок для всех запросов axios
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
            } else {
                localStorage.removeItem('qa_token')
                delete axios.defaults.headers.common['Authorization']
            }
        }
    },
    actions: {
        async register({ commit }, userData) {
            try {
                const response = await api.register(userData)
                if (response.data.success) {
                    commit('SET_USER', response.data.user)
                    if (response.data.token) {
                        commit('SET_TOKEN', response.data.token)
                    }
                    return { success: true, data: response.data }
                }
                return { success: false, message: response.data.message }
            } catch (error) {
                console.error('Registration error:', error)
                return { 
                    success: false, 
                    message: error.response?.data?.message || 'Registration failed'
                }
            }
        },
        
        async login({ commit }, credentials) {
            try {
                const response = await api.login(credentials)
                if (response.data.success) {
                    commit('SET_USER', response.data.user)
                    if (response.data.token) {
                        commit('SET_TOKEN', response.data.token)
                    }
                    return { success: true, data: response.data }
                }
                return { success: false, message: response.data.message }
            } catch (error) {
                console.error('Login error:', error)
                return { 
                    success: false, 
                    message: error.response?.data?.message || 'Login failed js'
                }
            }
        },
        
        async logout({ commit }) {
            try {
                // Проверяем, есть ли токен перед запросом на логаут
                if (axios.defaults.headers.common['Authorization']) {
                    await axios.post('/api/logout')
                }
            } catch (error) {
                console.error('Logout error:', error)
            } finally {
                commit('SET_USER', null)
                commit('SET_TOKEN', null)
            }
        },
        
        checkAuth({ commit }) {
            const user = localStorage.getItem('qa_current_user')
            const token = localStorage.getItem('qa_token')
            if (user && token) {
                commit('SET_USER', JSON.parse(user))
                commit('SET_TOKEN', token)
            }
        }
    }
})