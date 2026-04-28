// resources/js/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'
import Register from '../components/Register.vue'
import Login from '../components/Login.vue'
import MyQuestions from '../components/MyQuestions.vue'
import PublicProfile from '../components/PublicProfile.vue'

const routes = [
  { path: '/register', component: Register, meta: { guest: true } },
  { path: '/login', component: Login, meta: { guest: true } },
  { path: '/my-questions', component: MyQuestions, meta: { auth: true } },
  { path: '/user/:username', component: PublicProfile }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = store.state.isAuthenticated
  
  if (to.meta.auth && !isAuthenticated) {
    next('/login')
  } else if (to.meta.guest && isAuthenticated) {
    next('/my-questions')
  } else {
    next()
  }
})

export default router