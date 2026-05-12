// resources/js/services/localStorageApi.js
const STORAGE_KEYS = {
  USERS: 'qa_users',
  QUESTIONS: 'qa_questions',
  CURRENT_USER: 'qa_current_user'
}

export class LocalStorageAPI {
  constructor() {
    this.initializeTestData()
  }

  initializeTestData() {
    // Создаем тестового пользователя если его нет
    const users = this.getUsers()
    if (users.length === 0) {
      const testUser = {
        id: 1,
        name: 'Алексей Блогер',
        username: 'alex_blogger',
        email: 'alex@example.com',
        password: 'password123',
        bio: 'Блогер, путешественник, эксперт в сфере IT.',
        public_link: 'alex_blogger_public_link',
        created_at: new Date().toISOString()
      }
      this.saveUsers([testUser])

      // Создаем тестовые вопросы
      const testQuestions = [
        {
          id: 1,
          user_id: 1,
          content: 'Как вы начали свой блог и какие советы дадите новичкам?',
          image: null,
          is_answered: true,
          is_public: true,
          created_at: '2026-04-20T10:30:00',
          answer: {
            id: 1,
            content: 'Я начал с простого - писал о том, что меня интересует. Главный совет: не бойтесь начинать и будьте последовательными.',
            created_at: '2026-04-20T18:15:00'
          }
        }
      ]
      this.saveQuestions(testQuestions)
    }
  }

  getUsers() {
    const users = localStorage.getItem(STORAGE_KEYS.USERS)
    return users ? JSON.parse(users) : []
  }

  saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  }

  getQuestions() {
    const questions = localStorage.getItem(STORAGE_KEYS.QUESTIONS)
    return questions ? JSON.parse(questions) : []
  }

  saveQuestions(questions) {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions))
  }

  register(userData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const users = this.getUsers()
          
          if (users.find(u => u.email === userData.email)) {
            reject({ response: { data: { message: 'Пользователь с таким email уже существует' } } })
            return
          }
          
          if (users.find(u => u.username === userData.username)) {
            reject({ response: { data: { message: 'Пользователь с таким username уже существует' } } })
            return
          }

          const newUser = {
            id: users.length + 1,
            name: userData.name,
            username: userData.username,
            email: userData.email,
            password: userData.password,
            bio: '',
            public_link: `${userData.username}_public_link_${Date.now()}`,
            created_at: new Date().toISOString()
          }
          
          users.push(newUser)
          this.saveUsers(users)
          
          const { password, ...userWithoutPassword } = newUser
          
          resolve({
            data: {
              success: true,
              user: userWithoutPassword,
              message: 'Регистрация успешна'
            }
          })
        } catch (error) {
          reject(error)
        }
      }, 500)
    })
  }

  login(credentials) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const users = this.getUsers()
          const user = users.find(u => 
            u.email === credentials.email && u.password === credentials.password
          )
          
          if (!user) {
            reject({ 
              response: { 
                data: { message: 'Неверный email или пароль' } 
              } 
            })
            return
          }
          
          const { password, ...userWithoutPassword } = user
          
          resolve({
            data: {
              success: true,
              user: userWithoutPassword,
              token: `fake_token_${user.id}_${Date.now()}`,
              message: 'Вход выполнен'
            }
          })
        } catch (error) {
          reject(error)
        }
      }, 500)
    })
  }

  getMyQuestions(userId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const questions = this.getQuestions()
        const myQuestions = questions
          .filter(q => q.user_id === userId)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        
        resolve({ data: myQuestions })
      }, 300)
    })
  }

  getPublicQuestions(publicLink) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = this.getUsers()
        const user = users.find(u => u.public_link === publicLink)
        
        if (!user) {
          reject({ response: { status: 404, data: { message: 'Пользователь не найден' } } })
          return
        }
        
        const questions = this.getQuestions()
        const publicQuestions = questions
          .filter(q => q.user_id === user.id && q.is_public && q.answer)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        
        const { password, ...userWithoutPassword } = user
        
        resolve({
          data: {
            user: userWithoutPassword,
            questions: publicQuestions
          }
        })
      }, 300)
    })
  }

  askQuestion(publicLink, formData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = this.getUsers()
        const user = users.find(u => u.public_link === publicLink)
        
        if (!user) {
          reject({ response: { status: 404, data: { message: 'Пользователь не найден' } } })
          return
        }
        
        const questions = this.getQuestions()
        const newQuestion = {
          id: questions.length + 1,
          user_id: user.id,
          content: formData.get('content'),
          image: null,
          is_answered: false,
          is_public: false,
          created_at: new Date().toISOString(),
          answer: null
        }
        
        questions.push(newQuestion)
        this.saveQuestions(questions)
        
        resolve({
          data: {
            success: true,
            message: 'Вопрос успешно отправлен'
          }
        })
      }, 500)
    })
  }

  answerQuestion(questionId, answerContent) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const questions = this.getQuestions()
        const questionIndex = questions.findIndex(q => q.id === questionId)
        
        if (questionIndex === -1) {
          reject({ response: { status: 404 } })
          return
        }
        
        questions[questionIndex].answer = {
          id: Date.now(),
          content: answerContent,
          created_at: new Date().toISOString()
        }
        questions[questionIndex].is_answered = true
        questions[questionIndex].is_public = true
        
        this.saveQuestions(questions)
        
        resolve({ data: { success: true } })
      }, 500)
    })
  }

  toggleQuestionPublic(questionId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const questions = this.getQuestions()
        const questionIndex = questions.findIndex(q => q.id === questionId)
        
        if (questionIndex === -1) {
          reject({ response: { status: 404 } })
          return
        }
        
        questions[questionIndex].is_public = !questions[questionIndex].is_public
        this.saveQuestions(questions)
        
        resolve({ data: { success: true } })
      }, 300)
    })
  }
}