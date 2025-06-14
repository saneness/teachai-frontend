<template>
  <div class="class-detail p-4 md:p-6 lg:p-8">
    <div v-if="isLoading" class="text-center py-10">
      <p class="text-gray-500 text-lg">Loading class data...</p>
    </div>
    <div v-else-if="error" class="text-center py-10">
      <p class="text-red-500 text-lg">Error: {{ error }}</p> 
      <router-link to="/" class="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Back
      </router-link>
    </div>
    <div v-else-if="classData" class="bg-white p-6 rounded-lg shadow-xl">
      <!-- Top Back Button -->
      <div class="mb-4">
        <router-link to="/" class="text-blue-600 hover:text-blue-800 font-medium transition duration-150 ease-in-out inline-flex items-center">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"></path></svg>
           <span>Back</span>
        </router-link>
      </div>
      
      <!-- Header Content -->
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
          <div v-if="classData.students && classData.students.length > 0" class="bg-gray-50 p-4 rounded-md">
            <ul class="space-y-2">
              <li
                v-for="student in classData.students"
                :key="student.id"
                class="p-3 bg-white rounded shadow-sm border border-gray-200 hover:bg-gray-50"
              >
                <router-link 
                  :to="{ name: 'StudentProgress', params: { classId: classData.id, studentId: student.id }}"
                  class="font-medium text-blue-600 hover:text-blue-800"
                >
                  {{ student.name }}
                </router-link>
              </li>
            </ul>
          </div>
          <p v-else class="text-gray-500 italic">No students in this class yet.</p> 
        </div>

        <div>
          <h2 class="text-2xl font-semibold text-gray-700 mb-4">Program Lessons</h2>
          <div v-if="sortedProgramLessons && sortedProgramLessons.length > 0" class="bg-gray-50 p-4 rounded-md">
            <ul class="space-y-2">
              <li
                v-for="lesson in sortedProgramLessons"
                :key="lesson.id"
                class="p-3 bg-white rounded shadow-sm border border-gray-200 hover:bg-gray-50"
              >
                <router-link
                  :to="{ name: 'LessonProgress', params: { classId: classData.id, lessonId: lesson.id }}"
                  class="font-medium text-blue-600 hover:text-blue-800"
                >
                  {{ lesson.topic }}
                </router-link>
              </li>
            </ul>
          </div>
          <p v-else class="text-gray-500 italic">No lessons in the assigned program.</p>
        </div>
      </div>

      <!-- Bottom Back Button -->
      <div class="mt-8 pt-6 border-t border-gray-200">
        <router-link to="/" class="text-blue-600 hover:text-blue-800 font-medium transition duration-150 ease-in-out inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"></path></svg>
            <span>Back</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'; 
import apiClient from '../services/api';
// import ProgramMenu from '../components/ProgramMenu.vue'; 

const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  },
});

const classData = ref(null);
const isLoading = ref(true);
const error = ref(null);

const fetchClassDetails = async () => {
  isLoading.value = true;
  error.value = null;
  if (!props.id) {
      error.value = "Class ID is missing.";
      isLoading.value = false;
      return;
  }
  try {
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

const sortedProgramLessons = computed(() => {
  if (classData.value?.program_details?.lessons) {
    return [...classData.value.program_details.lessons].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
  }
  return [];
});
</script>