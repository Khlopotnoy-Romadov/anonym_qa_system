<template>
  <div class="container">
    <div class="card" style="max-width: 500px; margin: 50px auto;">
      <h2>Register</h2>
      <form @submit.prevent="register">
        <div class="form-group">
          <label>Name</label>
          <input type="text" v-model="form.name" class="form-control" required>
        </div>
        <div class="form-group">
          <label>Username</label>
          <input type="text" v-model="form.username" class="form-control" required>
          <small>Only letters, numbers, and dashes</small>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" v-model="form.email" class="form-control" required>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" v-model="form.password" class="form-control" required>
        </div>
        <div class="form-group">
          <label>Confirm Password</label>
          <input type="password" v-model="form.password_confirmation" class="form-control" required>
        </div>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
        <p style="margin-top: 15px;">
          Already have an account? <router-link to="/login">Login</router-link>
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
        const result = await this.register(this.form)
        if (result.success) {
          this.$router.push('/my-questions')
        }
      } catch (error) {
        console.error('Registration error:', error)
        this.error = error.response?.data?.message || error.message || 'Registration failed'
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