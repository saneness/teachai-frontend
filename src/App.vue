<template>
  <div id="app-container" class="min-h-screen flex flex-col">
    <SiteNavbar v-if="showNavbar" />
    <main class="flex-grow container mx-auto px-4 py-8">
      <router-view />
    </main>
    <footer class="bg-gray-800 text-white text-center p-4">
      <p>&copy; {{ new Date().getFullYear() }} Student Progress Tracker</p> <!-- Translated -->
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import SiteNavbar from './components/SiteNavbar.vue'; 

const route = useRoute();
const showNavbar = computed(() => {
  return !['Login', 'Register'].includes(route.name);
});
</script>

<style>
/* Global styles */
</style>