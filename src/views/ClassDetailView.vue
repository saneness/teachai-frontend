<template>
  <div class="class-detail p-4 md:p-6 lg:p-8">
    <div v-if="isLoading" class="text-center py-10">
      <p class="text-gray-500 text-lg">Loading class data...</p> 
    </div>
    <div v-else-if="error" class="text-center py-10">
      <p class="text-red-500 text-lg">Error: {{ error }}</p> 
      <router-link to="/" class="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Back to class list 
      </router-link>
    </div>
    <div v-else-if="classData" class="bg-white p-6 rounded-lg shadow-xl">
      <div class="mb-6 pb-4 border-b border-gray-200">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{{ classData.name }}</h1>
        <p v-if="classData.program_name" class="text-gray-600 text-md">
          Assigned Program: {{ classData.program_name }} 
        </p>
        <p v-else class="text-gray-500 text-md italic">No program assigned to this class.</p> 
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 class="text-2xl font-semibold text-gray-700 mb-4">Student List ({{ classData.students.length }})</h2> 
          <div v-if="classData.students && classData.students.length > 0" class="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
            <ul class="space-y-2">
              <li
                v-for="student in classData.students"
                :key="student.id"
                class="p-3 bg-white rounded shadow-sm border border-gray-200"
              >
                {{ student.name }}
              </li>
            </ul>
          </div>
          <p v-else class="text-gray-500 italic">No students in this class yet.</p> 
        </div>

        <div>
          <h2 class="text-2xl font-semibold text-gray-700 mb-4">Current Program Menu</h2> 
          <!-- Передаем уроки из program_details, если они есть -->
          <ProgramMenu :lessons="classData.program_details ? classData.program_details.lessons : []" />
        </div>
      </div>

      <div class="mt-8 pt-6 border-t border-gray-200">
        <router-link
          to="/"
          class="text-blue-600 hover:text-blue-800 font-medium transition duration-150 ease-in-out"
        >
          &larr; Back to all classes 
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'; 
import apiClient from '../services/api';
import ProgramMenu from '../components/ProgramMenu.vue'; 

const props = defineProps({
  id: { 
    type: [String, Number],
    required: true,
  },
});

const classData = ref(null);
const isLoading = ref(true);
const error = ref(null);

// programItems больше не нужен здесь, так как уроки приходят с classData.program_details

const fetchClassDetails = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    // Бэкенд теперь должен возвращать program_details с уроками, если программа назначена
    const response = await apiClient.get(`/classes/${props.id}`);
    classData.value = response.data;
  } catch (err) {
    console.error(`Failed to fetch class details for id ${props.id}:`, err);
    if (err.response && err.response.status === 404) {
        error.value = 'Class not found.'; 
    } else if (err.request) {
      error.value = 'Network Error: Could not connect to the server.';
    } else {
        error.value = err.response?.data?.msg || err.message || 'Failed to load class data'; 
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchClassDetails);
</script>