<template>
  <nav class="bg-blue-600 text-white shadow-md">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <router-link to="/" class="text-xl font-semibold hover:text-blue-200">
          Progress Tracker
        </router-link>
        <div>
          <router-link 
            to="/classes" 
            class="px-3 py-2 rounded-md text-sm font-medium"
            :class="[$route.name === 'Dashboard' || $route.name === 'Classes' || $route.name === 'ClassDetail' ? 'bg-blue-700' : 'hover:bg-blue-700']"
          >
            Classes
          </router-link>
          <router-link 
            to="/programs" 
            class="ml-4 px-3 py-2 rounded-md text-sm font-medium"
            :class="[$route.name === 'Programs' || $route.name === 'ProgramDetail' ? 'bg-blue-700' : 'hover:bg-blue-700']"
          >
            Programs <!-- НОВАЯ ССЫЛКА -->
          </router-link>
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