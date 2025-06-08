<template>
  <nav class="bg-blue-600 text-white shadow-md">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Эта ссылка ведет на объединенную панель управления -->
        <router-link to="/" class="text-xl font-semibold hover:text-blue-200">
          Progress Tracker
        </router-link>
        <div>
          <!-- Кнопка "Dashboard" удалена, т.к. логотип выполняет ее функцию -->
          <button
            @click="logout"
            class="ml-4 px-3 py-2 rounded-md text-sm font-medium bg-red-500 hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('teacherId');
  router.push({ name: 'Login' });
};
</script>