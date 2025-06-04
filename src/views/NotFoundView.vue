<template>
  <div class="flex flex-col items-center justify-center text-center min-h-[calc(100vh-200px)]">
    <h1 class="text-6xl font-bold text-blue-600 mb-4">404</h1>
    <h2 class="text-3xl font-semibold text-gray-700 mb-6">Page Not Found</h2> <!-- Translated -->
    <p class="text-gray-500 mb-8">
      Sorry, the page you are looking for does not exist or has been moved. <!-- Translated -->
    </p>
    <router-link
      to="/"
      class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition duration-150"
    >
      Go to Homepage <!-- Translated -->
    </router-link>
  </div>
</template>

<script setup>
// No special logic
</script>