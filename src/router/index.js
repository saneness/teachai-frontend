import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import DashboardView from '../views/DashboardView.vue';
import ClassDetailView from '../views/ClassDetailView.vue';
import ProgramDetailView from '../views/ProgramDetailView.vue'; 
import StudentProgressView from '../views/StudentProgressView.vue';
import LessonProgressView from '../views/LessonProgressView.vue';
import NotFoundView from '../views/NotFoundView.vue';

const routes = [
  { path: '/login', name: 'Login', component: LoginView, meta: { requiresGuest: true } },
  { path: '/register', name: 'Register', component: RegisterView, meta: { requiresGuest: true }},
  
  // Главный маршрут, который теперь ведет на объединенную панель управления
  { path: '/', name: 'Dashboard', component: DashboardView, meta: { requiresAuth: true } },
  
  // Маршруты для деталей остаются
  { path: '/class/:id', name: 'ClassDetail', component: ClassDetailView, props: true, meta: { requiresAuth: true } },
  { path: '/program/:id', name: 'ProgramDetail', component: ProgramDetailView, props: true, meta: { requiresAuth: true } },
  { path: '/class/:classId/student/:studentId', name: 'StudentProgress', component: StudentProgressView, props: true, meta: { requiresAuth: true } },
  {
    path: '/classes/:classId/lessons/:lessonId',
    name: 'LessonProgress',
    component: LessonProgressView,
    props: (route) => ({
      classId: parseInt(route.params.classId, 10),
      lessonId: parseInt(route.params.lessonId, 10)
    }),
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundView, }
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
    next({ name: 'Dashboard' }); 
  } else {
    next();
  }
});

export default router;