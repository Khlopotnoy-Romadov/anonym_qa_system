<template>
  <div id="app" :class="currentTheme">
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="nav-brand">Анонимная QA система</router-link>

        <div class="theme-switcher">
          <button
            v-for="theme in themes"
            :key="theme.value"
            @click="switchTheme(theme.value)"
            class="theme-btn"
            :class="{ 'active': currentTheme === theme.value }"
            :title="theme.name"
          >
            {{ theme.icon }}
          </button>
        </div>

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
  data() {
    return {
      currentTheme: 'default', 
      themes: [
        { value: 'default', name: 'По умолчанию', icon: '🌤️' },
        { value: 'cyberpunk', name: 'Киберпанк', icon: '🤖' },
        { value: 'retro', name: 'Ретро (Formspring)', icon: '📻' }, 
        { value: 'bright', name: 'Яркий', icon: '🌈' }
      ]
    }
  },
  computed: {
    ...mapState(['isAuthenticated', 'user'])
  },
  methods: {
    ...mapActions(['logout']),
    switchTheme(theme) {
      this.currentTheme = theme
      localStorage.setItem('app-theme', theme) // сохраняем выбор пользователя
    }
  },
  mounted() {

    const savedTheme = localStorage.getItem('app-theme')
    if (savedTheme && this.themes.find(t => t.value === savedTheme)) {
      this.currentTheme = savedTheme
    }
  }
}
</script>

<style>
/* БАЗОВЫЕ СТИЛИ (по умолчанию) */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background: #f5f5f5;
  transition: all 0.3s ease;
}

.navbar {
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 1rem 0;
  transition: all 0.3s ease;
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
  transition: color 0.3s ease;
}

.theme-switcher {
  display: flex;
  gap: 8px;
}

.theme-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.theme-btn:hover {
  transform: scale(1.1);
}

.theme-btn.active {
  border-color: #4a90e2;
  box-shadow: 0 0 10px rgba(74, 144, 226, 0.5);
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
  transition: all 0.3s ease;
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
  transition: border-color 0.3s;
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

/* СТИЛЬ КИБЕРПАНК */
#app.cyberpunk {
  --bg-primary: #0a0a1a;
  --bg-secondary: #12122a;
  --text-primary: #e0e0ff;
  --accent: #00f0ff;
  --accent-dark: #00a0b0;
  --card-bg: rgba(18, 18, 35, 0.9);
  --border: #006070;
}

#app.cyberpunk body {
  background: var(--bg-primary);
  color: var(--text-primary);
}

#app.cyberpunk .navbar {
  background: var(--bg-secondary);
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.2);
  border-bottom: 2px solid var(--accent);
}

#app.cyberpunk .nav-brand {
  color: var(--accent);
  text-shadow: 0 0 10px var(--accent);
}

#app.cyberpunk .nav-link,
#app.cyberpunk .btn-link {
  color: var(--text-primary);
  text-shadow: 0 0 5px var(--accent);
}

#app.cyberpunk .card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.1);
  border-radius: 6px;
}

#app.cyberpunk .btn-primary {
  background: var(--accent);
  color: var(--bg-primary);
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.4);
}

#app.cyberpunk .form-control {
  background: rgba(30, 30, 50, 0.7);
  border: 1px solid var(--border);
  color: var(--text-primary);
}

/* РЕТРО-СТИЛЬ (Formspring / ASKfm эпоха ~2009–2012) */
#app.retro {
  --bg-primary: #e8e4d9;
  --bg-secondary: #f0ead0;
  --text-primary: #2c2418;
  --accent: #f39c12;
  --accent-dark: #b45f1b;
  --card-bg: #fffef7;
  --border: #d4c9a8;
}

#app.retro body {
  background: var(--bg-primary);
  background-image: repeating-linear-gradient(
    45deg,
    rgba(200, 190, 170, 0.1) 0px,
    rgba(200, 190, 170, 0.1) 2px,
    transparent 2px,
    transparent 8px
  );
  font-family: 'Courier New', 'Lucida Sans Typewriter', monospace;
  font-size: 14px;
  color: var(--text-primary);
}

#app.retro .navbar {
  background: #2c3e2f;
  border-bottom: 3px solid var(--accent);
  padding: 0.75rem 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

#app.retro .nav-brand {
  font-family: 'Courier New', monospace;
  font-size: 1.6rem;
  font-weight: bold;
  color: #f7d44a;
  text-decoration: none;
  text-shadow: 2px 2px 0 #1a2a1a;
  letter-spacing: -1px;
}

#app.retro .nav-brand:hover {
  color: #fff2b5;
}

#app.retro .nav-link {
  font-family: 'Courier New', monospace;
  text-decoration: none;
  color: #f0ead0;
  font-weight: bold;
  font-size: 0.9rem;
  padding: 5px 10px;
  transition: all 0.2s;
  border: 1px solid transparent;
}

#app.retro .nav-link:hover {
  color: #f7d44a;
  border-bottom: 1px solid #f7d44a;
  background: rgba(0,0,0,0.2);
}

#app.retro .btn-link {
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  font-weight: bold;
  color: #f0ead0;
}

#app.retro .container {
  max-width: 860px;
  margin: 30px auto;
  padding: 0 20px;
}

/* ретро-карточка как на Formspring */
#app.retro .card {
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 24px;
  box-shadow: 5px 5px 0px 0px #b0a07c;
  transition: transform 0.1s ease;
}

#app.retro .card:hover {
  transform: translate(-1px, -1px);
  box-shadow: 6px 6px 0px 0px #9b8b68;
}

/* кнопки в ретро-стиле */
#app.retro .btn {
  display: inline-block;
  padding: 8px 18px;
  border: none;
  font-family: 'Courier New', monospace;
  font-weight: bold;
  font-size: 0.85rem;
  cursor: pointer;
  background: #e0d7c0;
  color: var(--text-primary);
  border-radius: 30px;
  transition: all 0.1s linear;
  box-shadow: 2px 2px 0px 0px #9b8b68;
}

#app.retro .btn-primary {
  background: var(--accent);
  color: var(--text-primary);
  border: 1px solid #e67e22;
  box-shadow: 2px 2px 0px 0px var(--accent-dark);
}

#app.retro .btn-primary:hover {
  background: #e67e22;
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0px 0px var(--accent-dark);
}

#app.retro .btn-danger {
  background: #c0392b;
  color: #fff2e0;
  border: 1px solid #a93226;
}

#app.retro .btn-danger:hover {
  background: #a93226;
}

/* формы и поля ввода — как в старых чатах */
#app.retro .form-group {
  margin-bottom: 18px;
}

#app.retro .form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: bold;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #6b5a3e;
}

#app.retro .form-control {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #dbcfa8;
  background: #fffff2;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  border-radius: 8px;
  transition: 0.1s;
}

#app.retro .form-control:focus {
  border-color: var(--accent);
  outline: none;
  background: #fffffc;
  box-shadow: inset 0 0 0 2px #fff2cc;
}

#app.retro textarea.form-control {
  resize: vertical;
  font-family: 'Courier New', monospace;
  line-height: 1.4;
}

/* вопрос-ответ как на старом ASKfm */
#app.retro .question-card {
  background: var(--card-bg);
  border-bottom: 1px solid #ede5cf;
  margin-bottom: 20px;
  padding: 0 0 20px 0;
  border-radius: 0;
  box-shadow: none;
}

#app.retro .question-card:last-child {
  border-bottom: none;
}

#app.retro .question-text {
  font-size: 1rem;
  font-weight: bold;
  color: #2c3e2f;
  background: #faf7e4;
  padding: 12px;
  border-left: 4px solid var(--accent);
  margin-bottom: 12px;
}

#app.retro .answer-content {
  background: #f0edd9;
  padding: 12px;
  border-left: 4px solid #2c3e2f;
  margin-top: 12px;
  font-style: normal;
  font-size: 0.9rem;
  color: var(--text-primary);
}

#app.retro .answer-content strong {
  color: #8b6946;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

#app.retro .question-meta {
  font-size: 0.7rem;
  color: #a08d66;
  margin-top: 12px;
  font-family: monospace;
}

#app.retro .report-btn {
  background: none;
  border: none;
  color: #bc8f6b;
  cursor: pointer;
  font-family: 'Courier New', monospace;
  font-size: 0.7rem;
  text-decoration: underline;
}

#app.retro .report-btn:hover {
  color: #c0392b;
}

/* статусы как в старых сервисах */
#app.retro .status {
  font-size: 0.7rem;
  padding: 2px 10px;
  border-radius: 30px;
  background: #d9d0b0;
  color: #3d3522;
  font-weight: bold;
}

#app.retro .status.answered {
  background: #2c6e2f;
  color: #f7e9b0;
}

/* ссылки */
#app.retro a {
  color: var(--accent-dark);
  text-decoration: none;
  font-weight: bold;
}

#app.retro a:hover {
  color: var(--accent);
  text-decoration: underline;
}

/* сообщения об ошибках */
#app.retro .error {
  background: #fee9e0;
  border-left: 4px solid #c0392b;
  padding: 12px;
  margin-top: 16px;
  font-family: monospace;
  font-size: 0.8rem;
  color: #a93226;
}

/* пустые состояния */
#app.retro .empty-state,
#app.retro .loading-state {
  text-align: center;
  padding: 40px;
  background: #fffef0;
  border: 1px dashed #dbcfaa;
  color: #8b7c58;
  font-family: monospace;
}

/* СТИЛЬ ЯРКИЙ */
#app.bright {
  --bg-primary: #fffbd5;
  --bg-secondary: #ffeb99;
  --text-primary: #333;
  --accent: #ff6b6b;
  --accent-dark: #c44569;
  --card-bg: #ffffff;
  --border: #ffd166;
}

#app.bright body {
  background: linear-gradient(45deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  color: var(--text-primary);
  font-family: 'Arial Rounded MT Bold', 'Arial', sans-serif;
}

#app.bright .navbar {
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 4px solid var(--accent);
  box-shadow: 0 8px 20px rgba(255, 107, 107, 0.3);
}

#app.bright .nav-brand {
  color: var(--accent-dark);
  text-shadow: 3px 3px 0 rgba(255, 209, 102, 0.8);
  font-size: 1.8rem;
  letter-spacing: 1px;
}

#app.bright .card {
  background: var(--card-bg);
  border: 3px solid var(--border);
  border-radius: 20px;
  box-shadow:
    0 10px 20px rgba(255, 107, 107, 0.2),
    inset 0 -5px 10px rgba(255, 209, 102, 0.4);
  padding: 25px;
}

#app.bright .btn-primary {
  background: linear-gradient(135deg, var(--accent) 0%, #ff8c8c 100%);
  color: white;
  border: none;
  box-shadow: 0 6px 0 var(--accent-dark);
  border-radius: 30px;
  font-weight: bold;
}

#app.bright .btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 0 var(--accent-dark);
}

#app.bright .btn-primary:active {
  transform: translateY(6px);
  box-shadow: none;
}

#app.bright .form-control {
  background: white;
  border: 3px solid var(--border);
  border-radius: 12px;
  padding: 12px 15px;
  font-size: 1rem;
  box-shadow: inset 0 3px 8px rgba(255, 209, 102, 0.3);
}

#app.bright .form-control:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 15px rgba(255, 107, 107, 0.4), inset 0 3px 8px rgba(255, 209, 102, 0.5);
}

/* ДОПОЛНИТЕЛЬНЫЕ СТИЛИ ДЛЯ ВСЕХ ТЕМ */
/* Плавные переходы для всех элементов при смене темы */
#app,
#app * {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Стили для состояний кнопок */
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.btn:active {
  transform: translateY(1px);
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .theme-switcher {
    justify-content: center;
  }

  .nav-menu {
    justify-content: center;
  }
}
</style>
