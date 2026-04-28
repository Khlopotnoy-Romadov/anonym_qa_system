<!-- resources/js/components/PublicProfile.vue -->
<template>
  <div class="container">
    <div class="profile-header card">
      <div class="profile-info">
        <div class="avatar">
          {{ displayUser.name.charAt(0) }}
        </div>
        <div>
          <h1>{{ displayUser.name }}</h1>
          <p class="username">@{{ displayUser.username }}</p>
          <p class="bio">{{ displayUser.bio || 'Нет информации о себе' }}</p>
        </div>
      </div>
    </div>

    <div class="ask-question card">
      <h3>Задать вопрос {{ displayUser.name }}</h3>
      <form @submit.prevent="submitQuestion">
        <div class="form-group">
          <textarea 
            v-model="questionContent" 
            class="form-control" 
            placeholder="Напишите ваш анонимный вопрос здесь..."
            required
          ></textarea>
        </div>
        <div class="form-group">
          <label>Прикрепить изображение (необязательно):</label>
          <input type="file" ref="imageInput" @change="handleImage" accept="image/*">
        </div>
        <button type="submit" class="btn btn-primary" :disabled="sending">
          {{ sending ? 'Отправка...' : 'Отправить анонимный вопрос' }}
        </button>
      </form>
    </div>

    <div class="questions-list">
      <h2>Публичные ответы</h2>
      
      <!-- Отображаем вопросы (реальные или тестовые) -->
      <div v-for="question in displayQuestions" :key="question.id" class="question-card card">
        <div class="question-content">
          <p class="question-text">{{ question.content }}</p>
          <img v-if="question.image" :src="getImageUrl(question.image)" class="question-image">
        </div>
        <div class="answer-content" v-if="question.answer">
          <strong>Ответ:</strong>
          <p>{{ question.answer.content }}</p>
          <div class="answer-date" v-if="question.answer.created_at">
            <small>Отвечено: {{ formatDate(question.answer.created_at) }}</small>
          </div>
        </div>
        <div class="question-meta">
          <small>Спросили: {{ formatDate(question.created_at) }}</small>
          <button 
            v-if="!question.is_reported"
            @click="reportQuestion(question.id)" 
            class="report-btn"
          >
            Пожаловаться
          </button>
        </div>
      </div>
      
      <!-- Сообщение если нет вопросов -->
      <div v-if="displayQuestions.length === 0 && !isLoading" class="card empty-state">
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
import axios from 'axios'

export default {
  data() {
    return {
      realUser: {},           // Реальный пользователь с сервера
      realQuestions: [],      // Реальные вопросы с сервера
      isLoading: false,       // Флаг загрузки
      questionContent: '',    // Текст вопроса
      imageFile: null,        // Изображение
      sending: false,         // Флаг отправки
      
      // Тестовые данные для демонстрации (если нет реальных)
      mockUser: {
        name: 'Алексей Блогер',
        username: 'alex_blogger',
        bio: 'Блогер, путешественник, эксперт в сфере IT. Отвечаю на вопросы о технологиях и жизни.'
      },
      mockQuestions: [
        {
          id: 1,
          content: 'Как вы начали свой блог и какие советы дадите новичкам?',
          image: null,
          created_at: '2026-04-20 10:30:00',
          is_reported: false,
          answer: {
            id: 1,
            content: 'Я начал с простого - писал о том, что меня интересует. Главный совет: не бойтесь начинать и будьте последовательными. Первые 3 месяца самые сложные, но потом становится легче!',
            created_at: '2026-04-20 18:15:00'
          }
        },
        {
          id: 2,
          content: 'Как вы относитесь к использованию AI в творчестве?',
          image: null,
          created_at: '2026-04-19 14:20:00',
          is_reported: false,
          answer: {
            id: 2,
            content: 'AI - отличный инструмент для вдохновения, но не замена человеческому творчеству. Я использую его для генерации идей и черновиков, но всегда дорабатываю вручную.',
            created_at: '2026-04-19 20:00:00'
          }
        },
        {
          id: 3,
          content: 'Какую книгу вы посоветуете для саморазвития?',
          image: null,
          created_at: '2026-04-18 09:15:00',
          is_reported: false,
          answer: {
            id: 3,
            content: 'Атомные привычки" Джеймса Клира - must read! Книга помогает понять, как маленькие изменения приводят к большим результатам.',
            created_at: '2026-04-18 16:30:00'
          }
        },
        {
          id: 4,
          content: 'Что вас вдохновляет продолжать создавать контент?',
          image: null,
          created_at: '2026-04-17 12:00:00',
          is_reported: false,
          answer: {
            id: 4,
            content: 'Обратная связь от подписчиков и возможность помогать людям. Когда кто-то пишет, что мой совет помог решить проблему - это лучшая мотивация!',
            created_at: '2026-04-17 19:45:00'
          }
        },
        {
          id: 5,
          content: 'Как вы справляетесь с критикой и негативными комментариями?',
          image: null,
          created_at: '2026-04-16 11:00:00',
          is_reported: false,
          answer: {
            id: 5,
            content: 'Конструктивную критику принимаю и анализирую. Троллей и хейтеров просто игнорирую - это не моя целевая аудитория.',
            created_at: '2026-04-16 17:20:00'
          }
        },
        {
          id: 6,
          content: 'Планируете ли вы запустить онлайн-курс?',
          image: null,
          created_at: '2026-04-15 08:45:00',
          is_reported: false,
          answer: null  // Пока нет ответа
        }
      ]
    }
  },
  computed: {
    // Отображаемый пользователь (реальный или тестовый)
    displayUser() {
      if (this.realUser && this.realUser.id) {
        return this.realUser
      }
      return this.mockUser
    },
    
    // Отображаемые вопросы (реальные или тестовые)
    displayQuestions() {
      if (this.realQuestions.length > 0) {
        return this.realQuestions
      }
      return this.mockQuestions
    }
  },
  async created() {
    await this.loadProfile()
  },
  methods: {
    async loadProfile() {
      this.isLoading = true
      const username = this.$route.params.username
      
      try {
        const response = await axios.get(`/api/user/${username}/questions`)
        
        if (response.data && response.data.user) {
          this.realUser = response.data.user
        }
        
        if (response.data && response.data.questions) {
          this.realQuestions = response.data.questions
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
        
        // Если пользователь не найден, но у нас есть тестовые данные
        if (error.response?.status === 404) {
          console.log('Пользователь не найден, показываем тестовые данные')
        }
      } finally {
        this.isLoading = false
      }
    },
    
    handleImage(event) {
      this.imageFile = event.target.files[0]
    },
    
    async submitQuestion() {
      if (!this.questionContent.trim()) {
        alert('Пожалуйста, напишите вопрос')
        return
      }
      
      this.sending = true
      const formData = new FormData()
      formData.append('content', this.questionContent)
      if (this.imageFile) {
        formData.append('image', this.imageFile)
      }
      
      try {
        // Используем public_link реального пользователя или тестовый
        const publicLink = this.realUser.public_link || 'test123'
        
        await axios.post(`/api/ask/${publicLink}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        
        this.questionContent = ''
        this.imageFile = null
        if (this.$refs.imageInput) this.$refs.imageInput.value = ''
        alert('Вопрос отправлен анонимно!')
        
      } catch (error) {
        console.error('Failed to send question:', error)
        
        if (error.response?.status === 404) {
          alert('Пользователь не найден. В тестовом режиме вопрос не отправляется на сервер.')
        } else if (error.response?.status === 422) {
          alert('Проверьте правильность заполнения формы')
        } else {
          alert('Ошибка при отправке вопроса: ' + (error.response?.data?.message || 'Неизвестная ошибка'))
        }
      } finally {
        this.sending = false
      }
    },
    
    async reportQuestion(questionId) {
      const reason = prompt('Пожалуйста, укажите причину жалобы:')
      if (!reason || reason.trim() === '') return
      
      try {
        await axios.post(`/api/questions/${questionId}/report`, { reason })
        alert('Жалоба отправлена. Спасибо за помощь в поддержании безопасности сообщества!')
      } catch (error) {
        console.error('Failed to report:', error)
        
        if (error.response?.status === 401) {
          alert('Для отправки жалобы необходимо войти в систему')
        } else {
          alert('Ошибка при отправке жалобы: ' + (error.response?.data?.message || 'Попробуйте позже'))
        }
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
    },
    
    // Метод для обновления данных (если нужно перезагрузить)
    refreshProfile() {
      this.loadProfile()
    }
  },
  watch: {
    // Следим за изменением параметров маршрута
    '$route.params.username': {
      handler() {
        this.loadProfile()
      },
      deep: true
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #999;
  font-size: 0.85rem;
}

.report-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 0.85rem;
  transition: color 0.3s;
}

.report-btn:hover {
  color: #e24a4a;
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

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #666;
  font-size: 0.9rem;
}
</style>