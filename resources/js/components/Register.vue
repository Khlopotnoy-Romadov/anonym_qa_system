<template>
  <div class="register-container">
    <div class="card">
      <h2>Регистрация</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label>Имя</label>
          <input 
            type="text" 
            v-model="form.name" 
            placeholder="Введите ваше имя"
            required
            class="form-control"
            :class="{ 'is-invalid': errors.name }"
          />
          <div v-if="errors.name" class="error-message">
            {{ errors.name[0] }}
          </div>
        </div>
        
        <div class="form-group">
          <label>Username</label>
          <input 
            type="text" 
            v-model="form.username" 
            placeholder="Введите username"
            required
            class="form-control"
            :class="{ 'is-invalid': errors.username }"
          />
          <div v-if="errors.username" class="error-message">
            {{ errors.username[0] }}
          </div>
        </div>
        
        <div class="form-group">
          <label>Email</label>
          <input 
            type="email" 
            v-model="form.email" 
            placeholder="Введите email"
            required
            class="form-control"
            :class="{ 'is-invalid': errors.email }"
          />
          <div v-if="errors.email" class="error-message">
            {{ errors.email[0] }}
          </div>
        </div>
        
        <div class="form-group">
          <label>Пароль</label>
          <input 
            type="password" 
            v-model="form.password" 
            placeholder="Минимум 4 символа"
            required
            class="form-control"
            :class="{ 'is-invalid': errors.password }"
          />
          <div v-if="errors.password" class="error-message">
            {{ errors.password[0] }}
          </div>
        </div>
        
        <div class="form-group">
          <label>Подтверждение пароля</label>
          <input 
            type="password" 
            v-model="form.password_confirmation" 
            placeholder="Повторите пароль"
            required
            class="form-control"
            :class="{ 'is-invalid': errors.password }"
          />
        </div>
        
        <button 
          type="submit" 
          class="btn btn-primary" 
          :disabled="loading"
        >
          {{ loading ? 'Регистрация...' : 'Зарегистрироваться' }}
        </button>
        
        <div v-if="generalError" class="error-message general-error">
          {{ generalError }}
        </div>
        
        <!-- Отладочная информация (убрать после исправления) -->
        <div v-if="Object.keys(errors).length > 0" class="debug-info">
          <strong>Ошибки валидации:</strong>
          <pre>{{ JSON.stringify(errors, null, 2) }}</pre>
        </div>
      </form>
      
      <p class="login-link">
        Уже есть аккаунт? <router-link to="/login">Войти</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { auth } from '../services/auth'

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
      errors: {},
      generalError: ''
    }
  },
  methods: {
    async handleRegister() {
      // Очищаем ошибки
      this.errors = {}
      this.generalError = ''
      
      this.loading = true
      
      try {
        console.log('Sending registration data:', this.form)
        const response = await auth.register(this.form)
        console.log('Registration result:', response)
        
        if (response.success) {
          this.$router.push('/dashboard')
        } else {
          if (response.errors && Object.keys(response.errors).length > 0) {
            this.errors = response.errors
            console.log('Validation errors:', this.errors)
          } else {
            this.generalError = response.message || 'Ошибка регистрации'
          }
        }
      } catch (error) {
        console.error('Registration error:', error)
        this.generalError = error.response?.data?.message || 'Ошибка соединения с сервером'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.register-container {
  max-width: 450px;
  margin: 50px auto;
  padding: 0 20px;
}

.card {
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-top: 0;
  margin-bottom: 20px;
  text-align: center;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #555;
  font-size: 14px;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-control:focus {
  outline: none;
  border-color: #4a90e2;
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 12px;
  margin-top: 5px;
}

.general-error {
  margin-top: 15px;
  text-align: center;
  background: #f8d7da;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #f5c6cb;
}

.debug-info {
  margin-top: 15px;
  padding: 10px;
  background: #f0f0f0;
  border-radius: 5px;
  font-size: 12px;
}

.debug-info pre {
  margin: 5px 0 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.btn-primary {
  width: 100%;
  padding: 10px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #357abd;
}

.btn-primary:disabled {
  background: #999;
  cursor: not-allowed;
}

.login-link {
  margin-top: 20px;
  text-align: center;
}

.login-link a {
  color: #4a90e2;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>