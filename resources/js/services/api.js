// resources/js/services/api.js
import axios from 'axios'

// Определяем режим работы
const USE_REAL_API = false // Переключите на true когда будет готов бэкенд

// Настройка реального API
if (USE_REAL_API) {
    axios.defaults.baseURL = 'http://127.0.0.1:8000'
    axios.defaults.headers.common['Accept'] = 'application/json'
    axios.defaults.headers.common['Content-Type'] = 'application/json'
    
    const token = localStorage.getItem('qa_token')
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
}

// Импорт локального хранилища для тестового режима
import { LocalStorageAPI } from './localStorageApi'

// Экспортируем соответствующий API
export const api = USE_REAL_API ? new RealAPI() : new LocalStorageAPI()

// Класс для работы с реальным API
class RealAPI {
    register(userData) {
        return axios.post('/api/register', userData)
    }

    login(credentials) {
        return axios.post('/api/login', credentials)
    }

    getMyQuestions() {
        return axios.get('/api/my-questions')
    }

    getPublicQuestions(publicLink) {
        return axios.get(`/api/user/${publicLink}/questions`)
    }

    askQuestion(publicLink, formData) {
        return axios.post(`/api/ask/${publicLink}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    }

    answerQuestion(questionId, content) {
        return axios.post(`/api/questions/${questionId}/answer`, { content })
    }

    toggleQuestionPublic(questionId) {
        return axios.patch(`/api/questions/${questionId}/toggle-public`)
    }
}