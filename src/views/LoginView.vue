<template>
  <div class="flex items-center justify-center min-h-[calc(100vh-150px)]">
    <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
      <h2 class="text-3xl font-bold text-center text-gray-800 mb-8">Login</h2> <!-- Translated -->
      <form @submit.prevent="handleLogin">
        <div class="mb-6">
          <label for="username" class="block text-gray-700 text-sm font-semibold mb-2">Username:</label> <!-- Translated -->
          <input
            type="text"
            id="username"
            v-model="username"
            required
            class="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div class="mb-6">
          <label for="password" class="block text-gray-700 text-sm font-semibold mb-2">Password:</label> <!-- Translated -->
          <input
            type="password"
            id="password"
            v-model="password"
            required
            class="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div v-if="errorMessage" class="mb-4 text-red-500 text-sm">
          {{ errorMessage }}
        </div>
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out disabled:opacity-50"
        >
          <span v-if="isLoading">Logging in...</span> <!-- Translated -->
          <span v-else>Login</span> <!-- Translated -->
        </button>
      </form>
      <p class="mt-6 text-center text-sm text-gray-600">
        No account? <!-- Translated -->
        <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-500">
          Register
        </router-link> <!-- Translated -->
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../services/api';

const username = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);
const router = useRouter();

const handleLogin = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = 'Please fill in all fields.'; // Translated
    return;
  }
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await apiClient.post('/login', {
      username: username.value,
      password: password.value,
    });
    localStorage.setItem('accessToken', response.data.access_token);
    localStorage.setItem('teacherId', response.data.teacher_id);
    router.push({ name: 'Dashboard' });
  } catch (error) {
    if (error.response && error.response.data && error.response.data.msg) {
      errorMessage.value = error.response.data.msg; // Backend message will be translated separately
    } else {
      errorMessage.value = 'Login failed. Please try again.'; // Translated
    }
    console.error('Login error:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>