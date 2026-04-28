<!-- resources/js/components/MyQuestions.vue -->
<template>
  <div class="container">
    <div class="card">
      <div class="share-section">
        <h2>Ваш публичный профиль</h2>
        <p>Поделитесь ссылкой, чтобы получать анонимные вопросы:</p>
        <div class="share-link">
          <input type="text" :value="profileUrl" readonly class="form-control">
          <button @click="copyLink" class="btn btn-primary">Copy Link</button>
        </div>
      </div>
    </div>

    <div class="questions-list">
      <h2>Полученные вопросы</h2>
      
      <!-- Тестовые данные для демонстрации -->
      <div v-for="question in displayQuestions" :key="question.id" class="question-card card">
        <div class="question-header">
          <span class="status" :class="{ answered: question.is_answered }">
            {{ question.is_answered ? '✓ Отвечено' : '❓ Ожидает ответа' }}
          </span>
          <label class="public-toggle">
            <input type="checkbox" v-model="question.is_public" @change="togglePublic(question)">
            Публичный
          </label>
        </div>
        
        <div class="question-content">
          <p><strong>Вопрос:</strong> {{ question.content }}</p>
          <img v-if="question.image" :src="getImageUrl(question.image)" class="question-image">
          <div v-if="question.created_at" class="question-date">
            <small>Получено: {{ formatDate(question.created_at) }}</small>
          </div>
        </div>

        <div v-if="question.answer" class="existing-answer">
          <strong>Ваш ответ:</strong>
          <p>{{ question.answer.content }}</p>
          <div v-if="question.answer.created_at" class="answer-date">
            <small>Отвечено: {{ formatDate(question.answer.created_at) }}</small>
          </div>
        </div>

        <div v-else class="answer-form">
          <textarea 
            v-model="answers[question.id]" 
            class="form-control" 
            placeholder="Напишите ваш ответ..."
            rows="3"
          ></textarea>
          <button @click="submitAnswer(question.id)" class="btn btn-primary">
            Опубликовать ответ
          </button>
        </div>
      </div>

      <!-- Сообщение если нет вопросов -->
      <div v-if="displayQuestions.length === 0 && !isLoading" class="card empty-state">
        <p>📭 У вас пока нет вопросов</p>
        <p class="hint">Поделитесь вашей публичной ссылкой, чтобы получать анонимные вопросы</p>
      </div>

      <!-- Индикатор загрузки -->
      <div v-if="isLoading" class="card loading-state">
        <p>Загрузка вопросов...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import axios from 'axios'

export default {
  computed: {
    ...mapState(['user']),
    profileUrl() {
      return `${window.location.origin}/user/${this.user?.username}`
    },
    // Объединяем реальные и тестовые данные
    displayQuestions() {
      if (this.realQuestions.length > 0) {
        return this.realQuestions
      }
      // Если реальных данных нет, показываем тестовые
      return this.mockQuestions
    }
  },
  data() {
    return {
      realQuestions: [],      // Реальные данные с сервера
      isLoading: false,       // Флаг загрузки
      answers: {},            // Временные ответы
      
      // Тестовые данные для демонстрации
      mockQuestions: [
        {
          id: 1,
          content: 'Как вам идея создания анонимного Q&A сервиса? Что вдохновило вас на это?',
          is_answered: false,
          is_public: true,
          image: null,
          created_at: '2026-04-21 10:30:00',
          answer: null
        },
        {
          id: 2,
          content: 'Какие технологии вы используете в этом проекте?',
          is_answered: false,
          is_public: true,
          image: null,
          created_at: '2026-04-20 15:45:00',
          answer: null
        },
        {
          id: 3,
          content: 'Планируете ли вы добавить возможность загружать несколько изображений к вопросу?',
          is_answered: true,
          is_public: true,
          image: null,
          created_at: '2026-04-19 09:20:00',
          answer: {
            id: 1,
            content: 'Да, это в планах! Сначала хочу реализовать базовый функционал, а затем добавить поддержку множественных изображений и видео.',
            created_at: '2026-04-19 14:15:00'
          }
        },
        {
          id: 4,
          content: 'Будет ли модерация контента и возможность жаловаться на оскорбительные вопросы?',
          is_answered: false,
          is_public: false,
          image: null,
          created_at: '2026-04-18 18:30:00',
          answer: null
        },
        {
          id: 5,
          content: 'Как вы решаете проблему анонимности и безопасности данных пользователей?',
          is_answered: true,
          is_public: true,
          image: null,
          created_at: '2026-04-17 12:00:00',
          answer: {
            id: 2,
            content: 'Мы используем шифрование данных, не храним IP-адреса задающих вопросы, а публичные ссылки генерируются случайным образом для дополнительной анонимности.',
            created_at: '2026-04-17 16:30:00'
          }
        }
      ]
    }
  },
  async created() {
    await this.loadQuestions()
  },
  methods: {
    // Загрузка реальных вопросов с сервера
    async loadQuestions() {
      this.isLoading = true
      try {
        const response = await axios.get('/api/my-questions')
        if (response.data && Array.isArray(response.data)) {
          this.realQuestions = response.data
          // Инициализируем answers для неотвеченных вопросов
          this.realQuestions.forEach(q => {
            if (!q.answer) {
              this.answers[q.id] = ''
            }
          })
        } else if (response.data && response.data.questions) {
          this.realQuestions = response.data.questions
        }
      } catch (error) {
        console.error('Failed to load questions:', error)
        // Если ошибка 401 (не авторизован), не показываем ошибку
        if (error.response?.status !== 401) {
          console.error('Error details:', error.response?.data)
        }
      } finally {
        this.isLoading = false
      }
    },
    
    // Отправка ответа
    async submitAnswer(questionId) {
      const content = this.answers[questionId]
      if (!content?.trim()) {
        alert('Пожалуйста, напишите ответ')
        return
      }
      
      try {
        await axios.post(`/api/questions/${questionId}/answer`, { content })
        await this.loadQuestions()
        alert('Ответ успешно опубликован!')
      } catch (error) {
        console.error('Failed to submit answer:', error)
        alert('Ошибка при публикации ответа: ' + (error.response?.data?.message || 'Неизвестная ошибка'))
      }
    },
    
    // Переключение публичности вопроса
    async togglePublic(question) {
      const originalValue = question.is_public
      try {
        await axios.patch(`/api/questions/${question.id}/toggle-public`)
      } catch (error) {
        console.error('Failed to toggle visibility:', error)
        question.is_public = originalValue
        alert('Ошибка при изменении видимости вопроса')
      }
    },
    
    // Копирование ссылки
    copyLink() {
      navigator.clipboard.writeText(this.profileUrl)
      alert('Ссылка скопирована в буфер обмена!')
    },
    
    // Получение URL изображения
    getImageUrl(path) {
      if (!path) return null
      return `/storage/${path}`
    },
    
    // Форматирование даты
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    
    // Очистка тестовых данных (для переключения на реальные)
    useRealData() {
      this.realQuestions = []
      this.loadQuestions()
    },
    
    // Сброс на тестовые данные
    resetToMockData() {
      this.realQuestions = []
      this.answers = {}
    }
  }
}
</script>

<style scoped>
.share-section {
  text-align: center;
}

.share-link {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.share-link input {
  flex: 1;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.status {
  font-size: 0.9rem;
  padding: 3px 10px;
  border-radius: 15px;
  background: #f0f0f0;
}

.status.answered {
  background: #d4edda;
  color: #155724;
}

.public-toggle {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  font-size: 0.9rem;
}

.existing-answer {
  background: #e8f5e9;
  padding: 15px;
  border-radius: 5px;
  margin-top: 15px;
}

.answer-form {
  margin-top: 15px;
}

.answer-form textarea {
  margin-bottom: 10px;
}

.question-date, .answer-date {
  margin-top: 8px;
  color: #999;
  font-size: 0.8rem;
}

.empty-state, .loading-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.hint {
  margin-top: 10px;
  font-size: 0.9rem;
  color: #999;
}
</style>