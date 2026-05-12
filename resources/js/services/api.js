// api.js - Сервис для работы с локальным хранилищем
// В будущем здесь будут реальные API-запросы

const STORAGE_KEYS = {
  USERS: 'qa_users',
  QUESTIONS: 'qa_questions',
  CURRENT_USER: 'qa_current_user'
}

// Инициализация тестовых данных
function initializeTestData() {
  // Создаем тестового пользователя если его нет
  const users = getUsers()
  if (users.length === 0) {
    const testUser = {
      id: 1,
      name: 'Алексей Блогер',
      username: 'alex_blogger',
      email: 'alex@example.com',
      password: 'password123', // В реальном приложении пароли должны быть захешированы
      bio: 'Блогер, путешественник, эксперт в сфере IT. Отвечаю на вопросы о технологиях и жизни.',
      public_link: 'alex_blogger_public_link',
      created_at: new Date().toISOString()
    }
    saveUsers([testUser])
  }

  // Создаем тестовые вопросы если их нет
  const questions = getQuestions()
  if (questions.length === 0) {
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
          content: 'Я начал с простого - писал о том, что меня интересует. Главный совет: не бойтесь начинать и будьте последовательными. Первые 3 месяца самые сложные, но потом становится легче!',
          created_at: '2026-04-20T18:15:00'
        }
      },
      {
        id: 2,
        user_id: 1,
        content: 'Как вы относитесь к использованию AI в творчестве?',
        image: null,
        is_answered: true,
        is_public: true,
        created_at: '2026-04-19T14:20:00',
        answer: {
          id: 2,
          content: 'AI - отличный инструмент для вдохновения, но не замена человеческому творчеству.',
          created_at: '2026-04-19T20:00:00'
        }
      },
      {
        id: 3,
        user_id: 1,
        content: 'Какую книгу вы посоветуете для саморазвития?',
        image: null,
        is_answered: true,
        is_public: true,
        created_at: '2026-04-18T09:15:00',
        answer: {
          id: 3,
          content: '"Атомные привычки" Джеймса Клира - must read!',
          created_at: '2026-04-18T16:30:00'
        }
      },
      {
        id: 4,
        user_id: 1,
        content: 'Что вас вдохновляет продолжать создавать контент?',
        image: null,
        is_answered: true,
        is_public: true,
        created_at: '2026-04-17T12:00:00',
        answer: {
          id: 4,
          content: 'Обратная связь от подписчиков и возможность помогать людям.',
          created_at: '2026-04-17T19:45:00'
        }
      },
      {
        id: 5,
        user_id: 1,
        content: 'Как вы справляетесь с критикой и негативными комментариями?',
        image: null,
        is_answered: true,
        is_public: true,
        created_at: '2026-04-16T11:00:00',
        answer: {
          id: 5,
          content: 'Конструктивную критику принимаю. Троллей игнорирую.',
          created_at: '2026-04-16T17:20:00'
        }
      },
      {
        id: 6,
        user_id: 1,
        content: 'Планируете ли вы запустить онлайн-курс?',
        image: null,
        is_answered: false,
        is_public: true,
        created_at: '2026-04-15T08:45:00',
        answer: null
      }
    ]
    saveQuestions(testQuestions)
  }
}

// Функции для работы с пользователями
function getUsers() {
  const users = localStorage.getItem(STORAGE_KEYS.USERS)
  return users ? JSON.parse(users) : []
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
}

// Функции для работы с вопросами
function getQuestions() {
  const questions = localStorage.getItem(STORAGE_KEYS.QUESTIONS)
  return questions ? JSON.parse(questions) : []
}

function saveQuestions(questions) {
  localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions))
}

// API методы
export const api = {
  // Регистрация
  register(userData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const users = getUsers()
          
          // Проверка на существующего пользователя
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
          saveUsers(users)
          
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
      }, 500) // Имитация задержки сети
    })
  },

  // Вход
  login(credentials) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const users = getUsers()
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
  },

  // Получение вопросов текущего пользователя
  getMyQuestions(userId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const questions = getQuestions()
          const myQuestions = questions
            .filter(q => q.user_id === userId)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          
          resolve({ data: myQuestions })
        } catch (error) {
          reject(error)
        }
      }, 300)
    })
  },

  // Получение публичных вопросов пользователя
  getPublicQuestions(publicLink) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const users = getUsers()
          const user = users.find(u => u.public_link === publicLink)
          
          if (!user) {
            reject({ response: { status: 404, data: { message: 'Пользователь не найден' } } })
            return
          }
          
          const questions = getQuestions()
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
        } catch (error) {
          reject(error)
        }
      }, 300)
    })
  },

  // Отправка анонимного вопроса
  askQuestion(publicLink, questionData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const users = getUsers()
          const user = users.find(u => u.public_link === publicLink)
          
          if (!user) {
            reject({ response: { status: 404, data: { message: 'Пользователь не найден' } } })
            return
          }
          
          const questions = getQuestions()
          const newQuestion = {
            id: questions.length + 1,
            user_id: user.id,
            content: questionData.get('content'),
            image: null, // В локальной версии без реальной загрузки файлов
            is_answered: false,
            is_public: false, // По умолчанию не публичный
            created_at: new Date().toISOString(),
            answer: null
          }
          
          questions.push(newQuestion)
          saveQuestions(questions)
          
          resolve({
            data: {
              success: true,
              message: 'Вопрос успешно отправлен'
            }
          })
        } catch (error) {
          reject(error)
        }
      }, 500)
    })
  },

  // Ответ на вопрос
  answerQuestion(questionId, answerContent) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const questions = getQuestions()
          const questionIndex = questions.findIndex(q => q.id === questionId)
          
          if (questionIndex === -1) {
            reject({ response: { status: 404, data: { message: 'Вопрос не найден' } } })
            return
          }
          
          questions[questionIndex].answer = {
            id: Date.now(),
            content: answerContent,
            created_at: new Date().toISOString()
          }
          questions[questionIndex].is_answered = true
          questions[questionIndex].is_public = true // Автоматически делаем публичным при ответе
          
          saveQuestions(questions)
          
          resolve({
            data: {
              success: true,
              message: 'Ответ опубликован'
            }
          })
        } catch (error) {
          reject(error)
        }
      }, 500)
    })
  },

  // Переключение публичности вопроса
  toggleQuestionPublic(questionId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const questions = getQuestions()
          const questionIndex = questions.findIndex(q => q.id === questionId)
          
          if (questionIndex === -1) {
            reject({ response: { status: 404 } })
            return
          }
          
          questions[questionIndex].is_public = !questions[questionIndex].is_public
          saveQuestions(questions)
          
          resolve({
            data: {
              success: true,
              is_public: questions[questionIndex].is_public
            }
          })
        } catch (error) {
          reject(error)
        }
      }, 300)
    })
  }
}

// Инициализация данных при загрузке
initializeTestData()