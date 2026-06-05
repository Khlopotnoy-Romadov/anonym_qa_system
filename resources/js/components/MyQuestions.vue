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
        <!-- Уведомление для копирования -->
        <div v-if="copyMessage" class="notification notification-success">
          {{ copyMessage }}
        </div>
      </div>
    </div>

    <div class="questions-list">
      <h2>Полученные вопросы</h2>
      
      <!-- Глобальное уведомление -->
      <div v-if="globalMessage" class="notification" :class="globalMessageType">
        {{ globalMessage }}
      </div>
      
      <div v-for="question in questions" :key="question.id" class="question-card card">
        <div class="question-header">
          <span class="status" :class="{ answered: question.is_answered }">
            {{ question.is_answered ? '✓ Отвечено' : '❓ Ожидает ответа' }}
          </span>
          <div class="header-actions">
            <label class="public-toggle">
              <input 
                type="checkbox" 
                :checked="question.is_public"
                @change="togglePublic(question)"
                :disabled="!question.is_answered"
              >
              Публичный
            </label>
            <button 
              @click="openDeleteDialog(question)" 
              class="btn-delete"
              title="Удалить вопрос"
            >
              🗑️
            </button>
          </div>
        </div>
        
        <div class="question-content">
          <p><strong>Вопрос:</strong> {{ question.content }}</p>
          <img v-if="question.image" :src="getImageUrl(question.image)" class="question-image">
          <div v-if="question.created_at" class="question-date">
            <small>Получено: {{ formatDate(question.created_at) }}</small>
          </div>
        </div>

        <!-- Уведомление для вопроса -->
        <div v-if="question.message" class="notification-local" :class="question.messageType">
          {{ question.message }}
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

    <!-- Диалоговое окно подтверждения удаления -->
    <div v-if="showDialog" class="dialog-overlay" @click.self="closeDialog">
      <div class="dialog">
        <div class="dialog-header">
          <h3>Подтверждение удаления</h3>
          <button class="dialog-close" @click="closeDialog">×</button>
        </div>
        <div class="dialog-body">
          <p>Вы уверены, что хотите удалить этот вопрос?</p>
          <p class="dialog-question">"{{ dialogQuestion?.content }}"</p>
          <p class="dialog-warning">Это действие необратимо.</p>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-secondary" @click="closeDialog">Отмена</button>
          <button class="btn btn-danger" @click="confirmDelete" :disabled="deleting">
            {{ deleting ? 'Удаление...' : 'Да, удалить' }}
          </button>
        </div>
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
      answers: {},
      copyMessage: '',
      globalMessage: '',
      globalMessageType: 'notification-success',
      showDialog: false,
      dialogQuestion: null,
      deleting: false
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
          // Добавляем поля для сообщений
          q.message = ''
          q.messageType = ''
        })
      } catch (error) {
        console.error('Failed to load questions:', error)
        this.showGlobalMessage('Ошибка загрузки вопросов', 'notification-error')
      } finally {
        this.isLoading = false
      }
    },
    
    async submitAnswer(questionId) {
      const content = this.answers[questionId]
      if (!content?.trim()) {
        this.showQuestionMessage(questionId, 'Пожалуйста, напишите ответ', 'notification-error')
        return
      }
      
      try {
        await api.answerQuestion(questionId, content)
        await this.loadQuestions()
        this.showQuestionMessage(questionId, 'Ответ успешно опубликован!', 'notification-success')
      } catch (error) {
        console.error('Failed to submit answer:', error)
        this.showQuestionMessage(questionId, 'Ошибка при публикации ответа: ' + (error.response?.data?.message || 'Неизвестная ошибка'), 'notification-error')
      }
    },
    
    async togglePublic(question) {
      const previousValue = question.is_public
      
      try {
        const response = await api.toggleQuestionPublic(question.id)
        
        if (response.data && typeof response.data.is_public !== 'undefined') {
          question.is_public = response.data.is_public
          this.showQuestionMessage(question.id, 
            question.is_public ? 'Вопрос теперь публичный' : 'Вопрос скрыт', 
            'notification-success'
          )
        } else {
          question.is_public = !question.is_public
        }
      } catch (error) {
        console.error('Failed to toggle visibility:', error)
        question.is_public = previousValue
        this.showQuestionMessage(question.id, 'Ошибка при изменении видимости вопроса', 'notification-error')
      }
    },
    
    openDeleteDialog(question) {
      this.dialogQuestion = question
      this.showDialog = true
    },
    
    closeDialog() {
      this.showDialog = false
      this.dialogQuestion = null
      this.deleting = false
    },
    
    async confirmDelete() {
      if (!this.dialogQuestion) return
      
      this.deleting = true
      
      try {
        await api.deleteQuestion(this.dialogQuestion.id)
        this.questions = this.questions.filter(q => q.id !== this.dialogQuestion.id)
        this.showGlobalMessage('Вопрос удален', 'notification-success')
        this.closeDialog()
      } catch (error) {
        console.error('Failed to delete question:', error)
        this.showGlobalMessage('Ошибка при удалении вопроса', 'notification-error')
        this.closeDialog()
      }
    },
    
    copyLink() {
      if (this.profileUrl) {
        navigator.clipboard.writeText(this.profileUrl)
          .then(() => {
            this.copyMessage = 'Ссылка скопирована в буфер обмена!'
            setTimeout(() => { this.copyMessage = '' }, 3000)
          })
          .catch(() => {
            this.copyMessage = 'Не удалось скопировать ссылку'
            setTimeout(() => { this.copyMessage = '' }, 3000)
          })
      }
    },
    
    showGlobalMessage(message, type) {
      this.globalMessage = message
      this.globalMessageType = type
      setTimeout(() => {
        this.globalMessage = ''
      }, 3000)
    },
    
    showQuestionMessage(questionId, message, type) {
      const question = this.questions.find(q => q.id === questionId)
      if (question) {
        question.message = message
        question.messageType = type
        setTimeout(() => {
          if (question.message === message) {
            question.message = ''
          }
        }, 3000)
      }
    },
    
    getImageUrl(path) {
      if (!path) return null
      if (path.startsWith('http')) {
        return path
      }
      return `/storage/${path}`
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return dateString
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 15px;
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
  user-select: none;
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

.btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 5px 8px;
  border-radius: 5px;
  transition: background 0.2s;
}

.btn-delete:hover {
  background: #fee;
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

.question-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 5px;
  margin-top: 10px;
  object-fit: cover;
}

.notification {
  padding: 12px 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  animation: fadeInOut 3s ease;
}

.notification-success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.notification-error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.notification-local {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  animation: fadeInOut 3s ease;
}

.notification-local.notification-success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.notification-local.notification-error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.dialog {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideUp 0.3s ease;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #111827;
}

.dialog-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background 0.2s;
}

.dialog-close:hover {
  background: #f3f4f6;
  color: #111827;
}

.dialog-body {
  padding: 24px;
}

.dialog-body p {
  margin: 0 0 12px 0;
  color: #374151;
}

.dialog-question {
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px;
  font-style: italic;
  color: #4b5563;
  border-left: 3px solid #ef4444;
  margin: 12px 0;
}

.dialog-warning {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 12px;
}

.dialog-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-danger {
  background: #ef4444;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s;
}

.btn-danger:hover {
  background: #dc2626;
}

.btn-danger:disabled {
  background: #fca5a5;
  cursor: not-allowed;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-10px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-10px); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>