<template>
  <div class="container">
    <div class="card" style="max-width: 500px; margin: 50px auto;">
      <h2>Регистрация</h2>
      <form @submit.prevent="register">
        <div class="form-group">
          <label> Имя </label>
          <input type="text" v-model="form.name" class="form-control" required>
        </div>
        <div class="form-group">
          <label> Ник </label>
          <input type="text" v-model="form.username" class="form-control" required>
        </div>
        <div class="form-group">
          <label>Почта</label>
          <input type="email" v-model="form.email" class="form-control" required>
        </div>
        <div class="form-group">
          <label>Пароль</label>
          <input type="password" v-model="form.password" class="form-control" required>
        </div>
        <div class="form-group">
          <label>Подтверждение пароля</label>
          <input type="password" v-model="form.password_confirmation" class="form-control" required>
        </div>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Регистрация...' : 'Зарегистрироваться' }}
        </button>
        <p style="margin-top: 15px;">
          Уже есть аккаунт? <router-link to="/login">Логин</router-link>
        </p>
      </form>
      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  data() {
    return {
      form: {
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: ''
      },
      loading: false,
      error: null
    }
  },
  methods: {
    ...mapActions(['register']),
    async register() {
      this.loading = true
      this.error = null
      
      try {
        console.log('Sending registration data:', this.form) // Отладка
        
        const result = await this.$store.dispatch('register', this.form)
        
        console.log('Registration result:', result) // Отладка
        
        if (result && result.success) {
          this.$router.push('/my-questions')
        } else {
          this.error = result?.message || 'Registration failed'
        }
      } catch (error) {
        console.error('Registration error:', error)
        
        // Детальная информация об ошибке
        if (error.response) {
          // Сервер вернул ошибку
          console.log('Error response:', error.response.data)
          console.log('Error status:', error.response.status)
          
          if (error.response.status === 422) {
            // Ошибки валидации
            const errors = error.response.data.errors
            const firstError = Object.values(errors)[0]
            this.error = Array.isArray(firstError) ? firstError[0] : firstError
          } else {
            this.error = error.response.data?.message || `Server error: ${error.response.status}`
          }
        } else if (error.request) {
          // Запрос был сделан, но ответ не получен
          this.error = 'No response from server. Check if API is running.'
          console.log('Error request:', error.request)
        } else {
          // Ошибка при настройке запроса
          this.error = error.message || 'An unexpected error occurred'
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.error {
  color: red;
  margin-top: 10px;
  padding: 10px;
  background: #fee;
  border-radius: 5px;
}
</style>