import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import DashboardView from '../views/DashboardView.vue'; // Это страница Классов
import ClassDetailView from '../views/ClassDetailView.vue';
import ProgramsView from '../views/ProgramsView.vue'; // НОВАЯ СТРАНИЦА для списка программ
import ProgramDetailView from '../views/ProgramDetailView.vue'; // НОВАЯ СТРАНИЦА для деталей программы
import NotFoundView from '../views/NotFoundView.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresGuest: true } 
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
    meta: { requiresGuest: true }
  },
  {
    path: '/', // Главная страница теперь будет списком классов
    name: 'Dashboard', // Оставим Dashboard для классов для обратной совместимости
    component: DashboardView,
    meta: { requiresAuth: true } 
  },
  {
    path: '/classes', // Явный путь для классов, если нужен
    name: 'Classes',
    component: DashboardView, // Используем тот же компонент
    meta: { requiresAuth: true }
  },
  {
    path: '/class/:id',
    name: 'ClassDetail',
    component: ClassDetailView,
    props: true, 
    meta: { requiresAuth: true }
  },
  { // НОВЫЕ МАРШРУТЫ ДЛЯ ПРОГРАММ
    path: '/programs',
    name: 'Programs',
    component: ProgramsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/program/:id',
    name: 'ProgramDetail',
    component: ProgramDetailView, // Пока будет заглушкой
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*', 
    name: 'NotFound',
    component: NotFoundView,
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('accessToken');

  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next({ name: 'Login' });
  } else if (to.matched.some(record => record.meta.requiresGuest) && isAuthenticated) {
    // Если пользователь аутентифицирован и пытается зайти на гостевую страницу,
    // перенаправляем его на главную (список классов)
    next({ name: 'Dashboard' }); 
  } else {
    next();
  }
});

export default router;