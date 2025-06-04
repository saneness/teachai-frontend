<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50" @click.self="closeModal">
    <div class="relative bg-white p-8 rounded-lg shadow-xl w-full max-w-lg mx-auto">
      <button @click="closeModal" class="absolute top-0 right-0 mt-4 mr-4 text-gray-600 hover:text-gray-800">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
      <h2 class="text-2xl font-bold text-gray-800 mb-6">{{ isEditing ? 'Edit Lesson' : 'Add New Lesson' }}</h2>
      <form @submit.prevent="submitForm">
        <div class="mb-4">
          <label for="lessonTopic" class="block text-gray-700 text-sm font-semibold mb-2">Lesson Topic:</label>
          <input
            type="text"
            id="lessonTopic"
            v-model="editableLesson.topic"
            required
            class="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="mb-6">
          <label for="lessonDescription" class="block text-gray-700 text-sm font-semibold mb-2">Description (optional):</label>
          <textarea
            id="lessonDescription"
            v-model="editableLesson.description"
            rows="4"
            class="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
         <div class="mb-4">
          <label for="lessonOrder" class="block text-gray-700 text-sm font-semibold mb-2">Order (optional, for sorting):</label>
          <input
            type="number"
            id="lessonOrder"
            v-model.number="editableLesson.order"
            min="0"
            class="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div v-if="errorMessage" class="mb-4 text-red-500 text-sm">
          {{ errorMessage }}
        </div>
        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            class="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <span v-if="isLoading">Saving...</span>
            <span v-else>{{ isEditing ? 'Save Changes' : 'Add Lesson' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../services/api';

const props = defineProps({
  programId: { // ID программы, к которой добавляется/редактируется урок
    type: Number,
    required: true,
  },
  lessonToEdit: {
    type: Object,
    default: null,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'lesson-saved']);

const editableLesson = ref({
  id: null,
  topic: '',
  description: '',
  order: null, // По умолчанию null, бэкенд может назначить порядок
});
const errorMessage = ref('');
const isLoading = ref(false);

onMounted(() => {
  if (props.isEditing && props.lessonToEdit) {
    editableLesson.value = { ...props.lessonToEdit };
  } else {
    editableLesson.value = { id: null, topic: '', description: '', order: null };
  }
});

const closeModal = () => {
  emit('close');
};

const submitForm = async () => {
  if (!editableLesson.value.topic.trim()) {
    errorMessage.value = 'Lesson topic is required.';
    return;
  }
  isLoading.value = true;
  errorMessage.value = '';

  const payload = {
    topic: editableLesson.value.topic,
    description: editableLesson.value.description,
    order: editableLesson.value.order === null || editableLesson.value.order === '' ? null : parseInt(editableLesson.value.order, 10), // Отправляем null или число
  };

  try {
    if (props.isEditing) {
      await apiClient.put(`/lessons/${editableLesson.value.id}`, payload);
    } else {
      await apiClient.post(`/programs/${props.programId}/lessons`, payload);
    }
    emit('lesson-saved');
    closeModal();
  } catch (error) {
    if (error.response && error.response.data && error.response.data.msg) {
      errorMessage.value = error.response.data.msg;
    } else if (error.request) {
      errorMessage.value = 'Network Error: Could not connect to the server.';
    } else {
      errorMessage.value = `Error ${props.isEditing ? 'updating' : 'adding'} lesson.`;
    }
    console.error('Lesson form error:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>