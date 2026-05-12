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

    <div class="ask-question card">
      <h3>Задать вопрос {{ profileUser.name }}</h3>
      <form @submit.prevent="submitQuestion">
        <div class="form-group">
          <textarea 
            v-model="questionContent" 
            class="form-control" 
            placeholder="Напишите ваш анонимный вопрос здесь..."
            rows="4"
            required
          ></textarea>
        </div>
        <button type="submit" class="btn btn-primary" :disabled="sending">
          {{ sending ? 'Отправка...' : 'Отправить анонимный вопрос' }}
        </button>
      </form>
    </div>

    <div class="questions-list">
      <h2>Публичные ответы</h2>
      
      <div v-for="question in questions" :key="question.id" class="question-card card">
        <div class="question-content">
          <p class="question-text">{{ question.content }}</p>
          <img v-if="question.image" :src="getImageUrl(question.image)" class="question-image">
        </div>
        <div class="answer-content">
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
      
      <!-- Сообщение если нет вопросов -->
      <div v-if="questions.length === 0 && !isLoading" class="card empty-state">
        <p>📭 Нет публичных вопросов</p>
        <p class="hint">Будьте первым, кто задаст вопрос!</p>
      </div>

      <!-- Индикатор загрузки -->
      <div v-if="isLoading" class="card loading-state">
        <p>Загрузка...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { api } from '../services/api'

export default {
  data() {
    return {
      profileUser: {
        name: '',
        username: '',
        bio: ''
      },
      questions: [],
      isLoading: false,
      questionContent: '',
      sending: false
    }
  },
  async created() {
    await this.loadProfile()
  },
  watch: {
    '$route.params.username': {
      handler() {
        this.loadProfile()
      }
    }
  },
  methods: {
    async loadProfile() {
      this.isLoading = true
      const publicLink = this.$route.params.username
      
      try {
        const response = await api.getPublicQuestions(publicLink)
        
        if (response.data.user) {
          this.profileUser = response.data.user
        }
        
        if (response.data.questions) {
          this.questions = response.data.questions
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
        
        if (error.response?.status === 404) {
          this.profileUser = { name: 'Пользователь не найден' }
        }
      } finally {
        this.isLoading = false
      }
    },
    
    async submitQuestion() {
      if (!this.questionContent.trim()) {
        alert('Пожалуйста, напишите вопрос')
        return
      }
      
      this.sending = true
      const formData = new FormData()
      formData.append('content', this.questionContent)
      
      try {
        const publicLink = this.$route.params.username
        
        await api.askQuestion(publicLink, formData)
        
        this.questionContent = ''
        alert('Вопрос отправлен анонимно!')
        
      } catch (error) {
        console.error('Failed to send question:', error)
        
        if (error.response?.status === 404) {
          alert('Пользователь не найден')
        } else {
          alert('Ошибка при отправке вопроса. Попробуйте позже.')
        }
      } finally {
        this.sending = false
      }
    },
    
    getImageUrl(path) {
      if (!path) return null
      return `/storage/${path}`
    },
    
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
    }
  }
}
</script>

<style scoped>
.profile-header {
  margin-bottom: 30px;
}

.profile-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #4a90e2;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
}

.username {
  color: #666;
  margin-top: 5px;
}

.bio {
  margin-top: 10px;
  color: #555;
}

.question-card {
  margin-bottom: 20px;
}

.question-text {
  font-size: 1.1rem;
  margin-bottom: 10px;
  line-height: 1.5;
}

.question-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 5px;
  margin-top: 10px;
}

.answer-content {
  background: #e8f5e9;
  padding: 15px;
  border-radius: 5px;
  margin-top: 15px;
}

.answer-date {
  margin-top: 8px;
  color: #666;
}

.question-meta {
  margin-top: 15px;
  color: #999;
  font-size: 0.85rem;
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