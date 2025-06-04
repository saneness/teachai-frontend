<!-- src/views/RegisterView.vue -->
<template>
  <div class="flex items-center justify-center min-h-[calc(100vh-150px)]">
    <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
      <h2 class="text-3xl font-bold text-center text-gray-800 mb-8">Register</h2>
      <form @submit.prevent="handleRegister">
        <div class="mb-6">
          <label for="username" class="block text-gray-700 text-sm font-semibold mb-2">Username:</label>
          <input
            type="text"
            id="username"
            v-model="username"
            required
            class="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div class="mb-6">
          <label for="password" class="block text-gray-700 text-sm font-semibold mb-2">Password:</label>
          <input
            type="password"
            id="password"
            v-model="password"  
            required
            class="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
         <div class="mb-6">
          <label for="confirmPassword" class="block text-gray-700 text-sm font-semibold mb-2">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword" 
            required
            class="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div v-if="errorMessage" class="mb-4 text-red-500 text-sm">
          {{ errorMessage }}
        </div>
         <div v-if="successMessage" class="mb-4 text-green-500 text-sm">
          {{ successMessage }}
        </div>
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 ease-in-out disabled:opacity-50"
        >
          <span v-if="isLoading">Registering...</span>
          <span v-else>Register</span>
        </button>
      </form>
      <p class="mt-6 text-center text-sm text-gray-600">
        Already have an account?
        <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500">
          Login
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
// ... остальная часть <script setup> остается без изменений
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../services/api';

const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);
const router = useRouter();

const handleRegister = async () => {
  if (!username.value || !password.value || !confirmPassword.value) {
    errorMessage.value = 'Please fill in all fields.';
    return;
  }
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.';
    return;
  }
  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    const response = await apiClient.post('/register', {
      username: username.value,
      password: password.value,
    });
    successMessage.value = response.data.msg + " You will be redirected to the login page.";
    setTimeout(() => {
        router.push({ name: 'Login' });
    }, 3000);
  } catch (error) {
     if (error.response && error.response.data && error.response.data.msg) {
      errorMessage.value = error.response.data.msg;
    } else if (error.request) {
      errorMessage.value = 'Network Error: Could not connect to the server. Please ensure the backend is running.';
      console.error('Network Error:', error.request);
    }
     else {
      errorMessage.value = 'Registration failed. Please try again.';
    }
    console.error('Registration error:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>