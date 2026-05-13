<template>
  <div class="container">
    <div class="card" style="max-width: 500px; margin: 50px auto;">
      <h2>Логин</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Почта</label>
          <input type="email" v-model="form.email" class="form-control" required>
        </div>
        <div class="form-group">
          <label>Пароль</label>
          <input type="password" v-model="form.password" class="form-control" required>
        </div>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Входит...' : 'Войти' }}
        </button>
        <p style="margin-top: 15px;">
          Еще нет аккаунта? <router-link to="/register">Зарегистрироваться</router-link>
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
        email: '',
        password: ''
      },
      loading: false,
      error: null
    }
  },
  methods: {
    ...mapActions(['login']),
    async handleLogin() {
      this.loading = true
      this.error = null
      try {
        const result = await this.login(this.form)
        if (result && result.success) {
          this.$router.push('/my-questions')
        } else {
          this.error = result?.message || 'Login failed'
        }
      } catch (error) {
        console.error('Login error:', error)
        this.error = error.response?.data?.message || error.message || 'Login failed'
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