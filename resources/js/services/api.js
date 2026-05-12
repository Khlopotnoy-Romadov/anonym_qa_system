// resources/js/services/api.js
import axios from 'axios'

const USE_REAL_API = true // поменять на false когда не работает бэкенд

// ============ Класс для работы с реальным API ============
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

// Настройка реального API если включено
if (USE_REAL_API) {
    axios.defaults.baseURL = 'http://127.0.0.1:8000'
    axios.defaults.headers.common['Accept'] = 'application/json'
    axios.defaults.headers.common['Content-Type'] = 'application/json'
    
    const token = localStorage.getItem('qa_token')
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    
    // Перехватчик для обработки ошибок
    axios.interceptors.response.use(
        response => response,
        error => {
            if (error.response?.status === 401) {
                localStorage.removeItem('qa_token')
                localStorage.removeItem('qa_current_user')
            }
            return Promise.reject(error)
        }
    )
}

// Импорт локального хранилища для тестового режима
import { LocalStorageAPI } from './localStorageApi'

// Экспортируем соответствующий API (теперь классы объявлены до использования)
export const api = USE_REAL_API ? new RealAPI() : new LocalStorageAPI()