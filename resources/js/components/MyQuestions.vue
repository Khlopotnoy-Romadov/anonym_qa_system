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
      
      <div v-for="question in questions" :key="question.id" class="question-card card">
        <div class="question-header">
          <span class="status" :class="{ answered: question.is_answered }">
            {{ question.is_answered ? '✓ Отвечено' : '❓ Ожидает ответа' }}
          </span>
          <label class="public-toggle">
            <!-- Исправлено: убираем v-model, используем :checked и @change -->
            <input 
              type="checkbox" 
              :checked="question.is_public"
              @change="togglePublic(question)"
              :disabled="!question.is_answered"
            >
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
          <button 
            @click="submitAnswer(question.id)" 
            class="btn btn-primary"
            :disabled="!answers[question.id]?.trim()"
          >
            Опубликовать ответ
          </button>
        </div>
      </div>

      <!-- Сообщение если нет вопросов -->
      <div v-if="questions.length === 0 && !isLoading" class="card empty-state">
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
import { api } from '../services/api'

export default {
  computed: {
    ...mapState(['user']),
    profileUrl() {
      if (this.user?.username) {
        return `${window.location.origin}/user/${this.user.username}`
      }
      if (this.user?.public_link) {
        return `${window.location.origin}/user/${this.user.public_link}`
      }
      return ''
    }
  },
  data() {
    return {
      questions: [],
      isLoading: false,
      answers: {}
    }
  },
  async created() {
    await this.loadQuestions()
  },
  methods: {
    async loadQuestions() {
      if (!this.user?.id) return
      
      this.isLoading = true
      try {
        const response = await api.getMyQuestions(this.user.id)
        this.questions = Array.isArray(response.data) ? response.data : []
        
        // Инициализируем answers для неотвеченных вопросов
        this.questions.forEach(q => {
          if (!q.answer && !this.answers[q.id]) {
            this.answers[q.id] = ''
          }
        })
      } catch (error) {
        console.error('Failed to load questions:', error)
      } finally {
        this.isLoading = false
      }
    },
    
    async submitAnswer(questionId) {
      const content = this.answers[questionId]
      if (!content?.trim()) {
        alert('Пожалуйста, напишите ответ')
        return
      }
      
      try {
        await api.answerQuestion(questionId, content)
        await this.loadQuestions() // Перезагружаем вопросы
        alert('Ответ успешно опубликован!')
      } catch (error) {
        console.error('Failed to submit answer:', error)
        alert('Ошибка при публикации ответа: ' + (error.response?.data?.message || 'Неизвестная ошибка'))
      }
    },
    
    async togglePublic(question) {
      // Сохраняем текущее значение на случай ошибки
      const previousValue = question.is_public
      
      try {
        const response = await api.toggleQuestionPublic(question.id)
        
        // Обновляем значение из ответа сервера
        if (response.data && typeof response.data.is_public !== 'undefined') {
          question.is_public = response.data.is_public
        } else {
          // Если сервер не вернул статус, переключаем локально
          question.is_public = !question.is_public
        }
      } catch (error) {
        console.error('Failed to toggle visibility:', error)
        // Возвращаем предыдущее значение
        question.is_public = previousValue
        alert('Ошибка при изменении видимости вопроса')
      }
    },
    
    copyLink() {
      if (this.profileUrl) {
        navigator.clipboard.writeText(this.profileUrl)
          .then(() => alert('Ссылка скопирована в буфер обмена!'))
          .catch(() => alert('Не удалось скопировать ссылку'))
      }
    },
    
    getImageUrl(path) {
      if (!path) return null
      // Проверяем, является ли путь уже полным URL
      if (path.startsWith('http')) {
        return path
      }
      return `/storage/${path}`
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      // Проверяем валидность даты
      if (isNaN(date.getTime())) {
        return dateString // Возвращаем как есть если невалидная дата
      }
      return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
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
  user-select: none; /* Предотвращает выделение текста */
}

.public-toggle input[type="checkbox"] {
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.public-toggle input[type="checkbox"]:disabled {
  cursor: not-allowed;
  opacity: 0.5;
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
  width: 100%;
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

/* Добавим стили для изображений вопросов */
.question-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 5px;
  margin-top: 10px;
  object-fit: cover;
}
</style>