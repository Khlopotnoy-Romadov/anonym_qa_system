<!-- resources/js/App.vue -->
<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="nav-brand">Anonymous QA</router-link>
        <div class="nav-menu">
          <template v-if="isAuthenticated">
            <router-link to="/my-questions" class="nav-link">Мои вопросы</router-link>
            <router-link :to="`/user/${user.username}`" class="nav-link">Мой профиль</router-link>
            <button @click="logout" class="nav-link btn-link">Выход</button>
          </template>
          <template v-else>
            <router-link to="/login" class="nav-link">Логин</router-link>
            <router-link to="/register" class="nav-link">Регистрация</router-link>
          </template>
        </div>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState(['isAuthenticated', 'user'])
  },
  methods: {
    ...mapActions(['logout'])
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: #f5f5f5;
}

.navbar {
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1rem 0;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4a90e2;
  text-decoration: none;
}

.nav-menu {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: #333;
  transition: color 0.3s;
}

.nav-link:hover {
  color: #4a90e2;
}

.btn-link {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
}

.btn-primary {
  background: #4a90e2;
  color: white;
}

.btn-primary:hover {
  background: #357abd;
}

.btn-danger {
  background: #e24a4a;
  color: white;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #666;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}


/* РЕТРО-СТИЛИ (Formspring / ASKfm эпоха ~2009-2012) */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Courier New', 'Lucida Sans Typewriter', monospace;
  background: #e8e4d9; /* старая бумажная текстура */
  background-image: repeating-linear-gradient(
    45deg,
    rgba(200, 190, 170, 0.1) 0px,
    rgba(200, 190, 170, 0.1) 2px,
    transparent 2px,
    transparent 8px
  );
  font-size: 14px;
  color: #2c2418;
}

/* навбар в стиле ранних соцсетей */
.navbar {
  background: #2c3e2f; /* тёмно-оливковый, как старый ASKfm */
  border-bottom: 3px solid #f39c12;
  padding: 0.75rem 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.nav-container {
  max-width: 980px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  font-family: 'Courier New', monospace;
  font-size: 1.6rem;
  font-weight: bold;
  color: #f7d44a;
  text-decoration: none;
  text-shadow: 2px 2px 0 #1a2a1a;
  letter-spacing: -1px;
}

.nav-brand:hover {
  color: #fff2b5;
}

.nav-menu {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-link {
  font-family: 'Courier New', monospace;
  text-decoration: none;
  color: #f0ead0;
  font-weight: bold;
  font-size: 0.9rem;
  padding: 5px 10px;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.nav-link:hover {
  color: #f7d44a;
  border-bottom: 1px solid #f7d44a;
  background: rgba(0,0,0,0.2);
}

.btn-link {
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  font-weight: bold;
  color: #f0ead0;
}

.container {
  max-width: 860px;
  margin: 30px auto;
  padding: 0 20px;
}

/* ретро-карточка как на Formspring */
.card {
  background: #fffef7;
  border: 1px solid #d4c9a8;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 24px;
  box-shadow: 5px 5px 0px 0px #b0a07c;
  transition: transform 0.1s ease;
}

.card:hover {
  transform: translate(-1px, -1px);
  box-shadow: 6px 6px 0px 0px #9b8b68;
}

/* кнопки в ретро-стиле */
.btn {
  display: inline-block;
  padding: 8px 18px;
  border: none;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 0.85rem;
  cursor: pointer;
  background: #e0d7c0;
  color: #2c2418;
  border-radius: 30px;
  transition: all 0.1s linear;
  box-shadow: 2px 2px 0px 0px #9b8b68;
}

.btn-primary {
  background: #f39c12;
  color: #2c2418;
  border: 1px solid #e67e22;
  box-shadow: 2px 2px 0px 0px #b45f1b;
}

.btn-primary:hover {
  background: #e67e22;
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0px 0px #b45f1b;
}

.btn-danger {
  background: #c0392b;
  color: #fff2e0;
  border: 1px solid #a93226;
}

.btn-danger:hover {
  background: #a93226;
}

/* формы и поля ввода — как в старых чатах */
.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: bold;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #6b5a3e;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #dbcfa8;
  background: #fffff2;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  border-radius: 8px;
  transition: 0.1s;
}

.form-control:focus {
  border-color: #f39c12;
  outline: none;
  background: #fffffc;
  box-shadow: inset 0 0 0 2px #fff2cc;
}

textarea.form-control {
  resize: vertical;
  font-family: 'Courier New', monospace;
  line-height: 1.4;
}

/* вопрос-ответ как на старом ASKfm */
.question-card {
  background: #fffef7;
  border-bottom: 1px solid #ede5cf;
  margin-bottom: 20px;
  padding: 0 0 20px 0;
  border-radius: 0;
  box-shadow: none;
}

.question-card:last-child {
  border-bottom: none;
}

.question-text {
  font-size: 1rem;
  font-weight: bold;
  color: #2c3e2f;
  background: #faf7e4;
  padding: 12px;
  border-left: 4px solid #f39c12;
  margin-bottom: 12px;
}

.answer-content {
  background: #f0edd9;
  padding: 12px;
  border-left: 4px solid #2c3e2f;
  margin-top: 12px;
  font-style: normal;
  font-size: 0.9rem;
  color: #2c2418;
}

.answer-content strong {
  color: #8b6946;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.question-meta {
  font-size: 0.7rem;
  color: #a08d66;
  margin-top: 12px;
  font-family: monospace;
}

.report-btn {
  background: none;
  border: none;
  color: #bc8f6b;
  cursor: pointer;
  font-family: 'Courier New', monospace;
  font-size: 0.7rem;
  text-decoration: underline;
}

.report-btn:hover {
  color: #c0392b;
}

/* статусы как в старых сервисах */
.status {
  font-size: 0.7rem;
  padding: 2px 10px;
  border-radius: 30px;
  background: #d9d0b0;
  color: #3d3522;
  font-weight: bold;
}

.status.answered {
  background: #2c6e2f;
  color: #f7e9b0;
}

/* ссылки */
a {
  color: #b45f1b;
  text-decoration: none;
  font-weight: bold;
}

a:hover {
  color: #e67e22;
  text-decoration: underline;
}

/* сообщения об ошибках */
.error {
  background: #fee9e0;
  border-left: 4px solid #c0392b;
  padding: 12px;
  margin-top: 16px;
  font-family: monospace;
  font-size: 0.8rem;
  color: #a93226;
}

/* пустые состояния */
.empty-state, .loading-state {
  text-align: center;
  padding: 40px;
  background: #fffef0;
  border: 1px dashed #dbcfaa;
  color: #8b7c58;
  font-family: monospace;
}
</style>