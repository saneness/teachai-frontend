<template>
  <div class="program-detail p-4 md:p-6 lg:p-8">
    <div v-if="isLoading" class="text-center py-10">
      <p class="text-gray-500 text-lg">Loading program data...</p>
    </div>
    <div v-else-if="error" class="text-center py-10">
      <p class="text-red-500 text-lg">Error: {{ error }}</p>
      <router-link to="/programs" class="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Back to program list
      </router-link>
    </div>
    <div v-else-if="programData" class="bg-white p-6 rounded-lg shadow-xl">
      <div class="mb-6 pb-4 border-b border-gray-200">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{{ programData.name }}</h1>
      </div>

      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-semibold text-gray-700">Lessons ({{ sortedProgramLessons.length }})</h2>
         <button
          @click="openAddLessonModal"
          class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
        >
          Add Lesson
        </button>
      </div>

      <div v-if="sortedProgramLessons.length > 0" class="space-y-4">
        <div v-for="lesson in sortedProgramLessons" :key="lesson.id" class="p-4 border rounded-md shadow-sm bg-gray-50">
           <div class="flex justify-between items-start">
            <div>
              <h3 class="text-xl font-semibold text-gray-800">{{ lesson.topic }}</h3>
              <p class="text-xs text-gray-500 mt-0.5">Order: {{ lesson.order === null ? 'N/A' : lesson.order }}</p>
            </div>
            <div class="flex space-x-2 flex-shrink-0">
              <button @click="openEditLessonModal(lesson)" class="text-sm text-yellow-600 hover:text-yellow-800" title="Edit lesson">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
              </button>
              <button @click="confirmDeleteLesson(lesson)" class="text-sm text-red-600 hover:text-red-800" title="Delete lesson">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
              </button>
            </div>
          </div>
          <!-- ИЗМЕНЕНИЕ: Добавлен класс whitespace-pre-wrap -->
          <p class="text-gray-600 mt-2 whitespace-pre-wrap text-sm">{{ lesson.description || 'No description.' }}</p>
        </div>
      </div>
      <p v-else class="text-gray-500 italic mt-4">No lessons in this program yet. Add one to get started!</p>
      
      <div class="mt-8 pt-6 border-t border-gray-200">
        <router-link
          to="/programs"
          class="text-blue-600 hover:text-blue-800 font-medium transition duration-150 ease-in-out"
        >
          &larr; Back to all programs
        </router-link>
      </div>
    </div>

    <!-- Модальные окна -->
    <LessonForm
        v-if="showLessonModal"
        :program-id="programData.id"
        :lesson-to-edit="lessonToEdit"
        :is-editing="isEditingLesson"
        @close="closeLessonModal"
        @lesson-saved="handleLessonSaved"
    />
     <div v-if="showDeleteLessonConfirmModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 class="text-xl font-semibold mb-4">Confirm Lesson Deletion</h3>
            <p class="mb-6">Are you sure you want to delete the lesson "{{ lessonToDelete?.topic }}"?</p>
            <div class="flex justify-end space-x-3">
                <button @click="showDeleteLessonConfirmModal = false" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                <button @click="deleteLesson" class="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700">Delete</button>
            </div>
        </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import apiClient from '../services/api';
import LessonForm from '../components/LessonForm.vue'; 

const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  },
});

const programData = ref(null);
const isLoading = ref(true);
const error = ref(null);

const showLessonModal = ref(false);
const isEditingLesson = ref(false);
const lessonToEdit = ref(null);
const showDeleteLessonConfirmModal = ref(false);
const lessonToDelete = ref(null);

const sortedProgramLessons = computed(() => {
  if (programData.value && programData.value.lessons) {
    return [...programData.value.lessons].sort((a, b) => {
      if (a.order === null) return 1;
      if (b.order === null) return -1;
      return a.order - b.order;
    });
  }
  return [];
});


const fetchProgramDetails = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await apiClient.get(`/programs/${props.id}`);
    programData.value = response.data;
  } catch (err) {
    console.error(`Failed to fetch program details for id ${props.id}:`, err);
    if (err.response && err.response.status === 404) {
        error.value = 'Program not found.';
    } else if (err.request) {
      error.value = 'Network Error: Could not connect to the server.';
    } else {
        error.value = err.response?.data?.msg || err.message || 'Failed to load program data';
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchProgramDetails);

const openAddLessonModal = () => {
  isEditingLesson.value = false;
  lessonToEdit.value = null;
  showLessonModal.value = true;
};

const openEditLessonModal = (lesson) => {
  lessonToEdit.value = { ...lesson };
  isEditingLesson.value = true;
  showLessonModal.value = true;
};

const closeLessonModal = () => {
  showLessonModal.value = false;
  lessonToEdit.value = null;
};

const handleLessonSaved = () => {
  fetchProgramDetails(); 
};

const confirmDeleteLesson = (lesson) => {
  lessonToDelete.value = lesson;
  showDeleteLessonConfirmModal.value = true;
};

const deleteLesson = async () => {
  if (!lessonToDelete.value) return;
  try {
    await apiClient.delete(`/lessons/${lessonToDelete.value.id}`);
    fetchProgramDetails();
  } catch (err) {
    console.error('Failed to delete lesson:', err);
    error.value = 'Failed to delete lesson.'; 
  } finally {
    showDeleteLessonConfirmModal.value = false;
    lessonToDelete.value = null;
  }
};
</script>