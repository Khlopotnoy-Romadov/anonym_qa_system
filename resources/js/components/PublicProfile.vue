<template>
  <div class="container">
    <div class="profile-header card">
      <div class="profile-info">
        <div class="avatar">
          {{ profileUser.name?.charAt(0) || '?' }}
        </div>
        <div>
          <h1>{{ profileUser.name }}</h1>
          <p class="username">@{{ profileUser.username }}</p>
          <p class="bio">{{ profileUser.bio || 'Нет информации о себе' }}</p>
        </div>
      </div>
    </div>

    <div class="ask-question card" v-if="!notFound">
      <h3>Задать вопрос {{ profileUser.name }}</h3>
      <form @submit.prevent="submitQuestion">
        <div class="form-group">
          <textarea 
            v-model="questionContent" 
            class="form-control" 
            :class="{ 'is-danger': toxicityError, 'is-checking': isChecking }"
            placeholder="Напишите ваш анонимный вопрос здесь..."
            rows="4"
            required
            :disabled="isChecking || sending"
          ></textarea>
          
          <!-- Индикатор проверки токсичности -->
          <div v-if="isChecking && !successMessage" class="toxicity-checking">
            <div class="checking-spinner"></div>
            <div class="checking-text">
              <strong>Проверка вопроса на токсичность...</strong>
              <div class="checking-hint">Это может занять несколько секунд</div>
            </div>
          </div>
          
          <!-- Сообщение об успехе -->
          <div v-if="successMessage" class="success-message">
            <span class="success-icon">✅</span>
            <div>
              <strong>{{ successMessage }}</strong>
            </div>
          </div>
          
          <!-- Ошибка токсичности -->
          <div v-if="toxicityError" class="toxicity-error">
            <span class="error-icon">🚫</span>
            <div>
              <strong>{{ toxicityMessage }}</strong>
              <div class="toxicity-score" v-if="toxicityScore">
                Уровень токсичности: {{ Math.round(toxicityScore * 100) }}%
              </div>
              <button type="button" @click="clearToxicityError" class="toxicity-clear-btn">
                ✏️ Изменить вопрос
              </button>
            </div>
          </div>
          
          <!-- Ошибка отправки -->
          <div v-if="errorMessage && !toxicityError" class="toxicity-error">
            <span class="error-icon">❌</span>
            <div>
              <strong>{{ errorMessage }}</strong>
              <button type="button" @click="clearErrorMessage" class="toxicity-clear-btn">
                ✏️ Попробовать снова
              </button>
            </div>
          </div>
        </div>
        
        <button type="submit" class="btn btn-primary" :disabled="sending || isChecking">
          <span v-if="sending" class="sending-spinner"></span>
          {{ sending ? 'Отправка...' : 'Отправить анонимный вопрос' }}
        </button>
      </form>
    </div>

    <div class="questions-list" v-if="!notFound">
      <h2>Публичные ответы</h2>
      
      <div v-for="question in questions" :key="question.id" class="question-card card">
        <div class="question-content">
          <p class="question-text">{{ question.content }}</p>
        </div>
        <div class="answer-content" v-if="question.answer">
          <strong>Ответ:</strong>
          <p>{{ question.answer.content }}</p>
          <div class="answer-date">
            <small>Отвечено: {{ formatDate(question.answer.created_at) }}</small>
          </div>
        </div>
        <div class="question-meta">
          <small>Спросили: {{ formatDate(question.created_at) }}</small>
        </div>
      </div>
      
      <div v-if="questions.length === 0 && !isLoading" class="card empty-state">
        <p>📭 Нет публичных вопросов</p>
        <p class="hint">Будьте первым, кто задаст вопрос!</p>
      </div>

      <div v-if="isLoading" class="card loading-state">
        <p>Загрузка...</p>
      </div>
    </div>

    <div v-if="notFound && !isLoading" class="card">
      <h2>Пользователь не найден</h2>
    </div>
  </div>
</template>

<script>
import { api } from '../services/api'

export default {
  data() {
    return {
      profileUser: { name: '', username: '', bio: '', public_link: '' },
      questions: [],
      isLoading: false,
      questionContent: '',
      sending: false,
      notFound: false,
      toxicityError: false,
      toxicityMessage: '',
      toxicityScore: 0,
      isChecking: false,
      successMessage: '',
      errorMessage: ''
    }
  },
  computed: {
    userParam() {
      return this.$route.params.username
    }
  },
  async created() {
    await this.loadProfile()
  },
  watch: {
    userParam() {
      this.loadProfile()
    },
    // Очищаем ошибку при изменении текста
    questionContent(newVal, oldVal) {
      if ((this.toxicityError || this.errorMessage) && newVal !== oldVal) {
        this.clearToxicityError()
        this.clearErrorMessage()
      }
    }
  },
  methods: {
    async loadProfile() {
      if (!this.userParam) return
      this.isLoading = true
      this.notFound = false
      
      try {
        const response = await api.getPublicQuestions(this.userParam)
        if (response.data.user) this.profileUser = response.data.user
        if (response.data.questions) this.questions = response.data.questions
      } catch (error) {
        if (error.response?.status === 404) this.notFound = true
      } finally {
        this.isLoading = false
      }
    },
    
    async submitQuestion() {
      if (!this.questionContent.trim()) {
        this.errorMessage = 'Пожалуйста, напишите вопрос'
        setTimeout(() => this.clearErrorMessage(), 5000)
        return
      }
      
      // Начинаем проверку токсичности
      this.isChecking = true
      this.toxicityError = false
      this.errorMessage = ''
      this.successMessage = ''
      
      // Создаем FormData для отправки
      const formData = new FormData()
      formData.append('content', this.questionContent)
      
      try {
        const userIdentifier = this.profileUser.public_link || this.userParam
        
        // Отправляем вопрос - проверка токсичности происходит на бекенде
        const response = await api.askQuestion(userIdentifier, formData)
        
        if (response.data.success) {
          this.questionContent = ''
          this.successMessage = 'Вопрос отправлен анонимно!'
          
          // Скрываем сообщение через 5 секунд
          setTimeout(() => {
            this.successMessage = ''
          }, 5000)
          
          await this.loadProfile()
        }
      } catch (error) {
        if (error.response?.status === 422 && error.response.data.is_toxic) {
          this.toxicityError = true
          this.toxicityMessage = error.response.data.message
          this.toxicityScore = error.response.data.toxicity?.score || 0
        } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          this.errorMessage = '⏱️ Проверка вопроса занимает слишком много времени. Пожалуйста, попробуйте еще раз или задайте более короткий вопрос.'
          setTimeout(() => this.clearErrorMessage(), 5000)
        } else {
          this.errorMessage = error.response?.data?.message || 'Ошибка отправки вопроса'
          setTimeout(() => this.clearErrorMessage(), 5000)
        }
      } finally {
        this.sending = false
        this.isChecking = false
      }
    },
    
    clearToxicityError() {
      this.toxicityError = false
      this.toxicityMessage = ''
      this.toxicityScore = 0
    },
    
    clearErrorMessage() {
      this.errorMessage = ''
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      return new Date(dateString).toLocaleString('ru-RU', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    }
  }
}
</script>

<style scoped>
.profile-header { margin-bottom: 30px; }
.profile-info { display: flex; align-items: center; gap: 20px; }
.avatar { width: 80px; height: 80px; border-radius: 50%; background: #4a90e2; color: white; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: bold; }
.username { color: #666; margin-top: 5px; }
.bio { margin-top: 10px; color: #555; }
.question-card { margin-bottom: 20px; }
.question-text { font-size: 1.1rem; margin-bottom: 10px; line-height: 1.5; }
.answer-content { background: #e8f5e9; padding: 15px; border-radius: 5px; margin-top: 15px; }
.answer-date { margin-top: 8px; color: #666; }
.question-meta { margin-top: 15px; color: #999; font-size: 0.85rem; }
.empty-state, .loading-state { text-align: center; padding: 40px; color: #666; }
.hint { margin-top: 10px; font-size: 0.9rem; color: #999; }

.toxicity-error {
  margin-top: 10px;
  padding: 12px 15px;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  color: #721c24;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.error-icon { font-size: 1.5rem; }

.toxicity-score {
  margin-top: 5px;
  font-size: 0.85rem;
  color: #721c24;
}

.is-danger {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
}

.is-checking {
  border-color: #4a90e2 !important;
  background-color: #f8f9ff !important;
}

.toxicity-checking {
  margin-top: 10px;
  padding: 12px 15px;
  background: #e3f2fd;
  border: 1px solid #90caf9;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.success-message {
  margin-top: 10px;
  padding: 12px 15px;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  color: #155724;
  display: flex;
  align-items: center;
  gap: 10px;
}

.success-icon {
  font-size: 1.5rem;
}

.checking-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e3f2fd;
  border-top: 3px solid #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.checking-text {
  flex: 1;
}

.checking-hint {
  font-size: 0.85rem;
  color: #1976d2;
  margin-top: 4px;
}

.sending-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
  vertical-align: middle;
}

.toxicity-clear-btn {
  background: none;
  border: none;
  color: #721c24;
  text-decoration: underline;
  cursor: pointer;
  margin-top: 6px;
  padding: 0;
  font-size: 0.85rem;
}

.toxicity-clear-btn:hover {
  color: #491217;
}
</style>