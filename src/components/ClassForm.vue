<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50" @click.self="closeModal">
    <div class="relative bg-white p-8 rounded-lg shadow-xl w-full max-w-lg mx-auto">
      <button @click="closeModal" class="absolute top-0 right-0 mt-4 mr-4 text-gray-600 hover:text-gray-800">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
      <h2 class="text-2xl font-bold text-gray-800 mb-6">{{ isEditing ? 'Edit Class' : 'Create New Class' }}</h2> <!-- Translated -->
      <form @submit.prevent="submitForm">
        <div class="mb-4">
          <label for="className" class="block text-gray-700 text-sm font-semibold mb-2">Class Name:</label> <!-- Translated -->
          <input
            type="text"
            id="className"
            v-model="editableClass.name"
            required
            class="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="mb-4">
          <label for="programName" class="block text-gray-700 text-sm font-semibold mb-2">Program Name (optional):</label> <!-- Translated -->
          <input
            type="text"
            id="programName"
            v-model="editableClass.program_name"
            class="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="mb-6">
          <label for="students" class="block text-gray-700 text-sm font-semibold mb-2">
            Students (one name per line): <!-- Translated -->
          </label>
          <textarea
            id="students"
            v-model="studentsText"
            rows="5"
            class="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="John Doe&#10;Jane Smith&#10;Peter Jones" 
          ></textarea> <!-- Translated placeholder -->
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
            Cancel <!-- Translated -->
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            class="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <span v-if="isLoading">Saving...</span> <!-- Translated -->
            <span v-else>{{ isEditing ? 'Save Changes' : 'Create Class' }}</span> <!-- Translated -->
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
  classToEdit: {
    type: Object,
    default: null,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'class-saved']);

const editableClass = ref({
  id: null,
  name: '',
  program_name: '',
  students: [], 
});
const studentsText = ref(''); 
const errorMessage = ref('');
const isLoading = ref(false);

onMounted(() => {
  if (props.isEditing && props.classToEdit) {
    editableClass.value = { ...props.classToEdit }; 
    if (props.classToEdit.students && Array.isArray(props.classToEdit.students)) {
        studentsText.value = props.classToEdit.students.map(s => s.name || s).join('\n');
    } else {
        studentsText.value = '';
    }
  } else {
    editableClass.value = { id: null, name: '', program_name: '', students: [] };
    studentsText.value = '';
  }
});


const closeModal = () => {
  emit('close');
};

const submitForm = async () => {
  if (!editableClass.value.name) {
    errorMessage.value = 'Class name is required.'; // Translated
    return;
  }
  isLoading.value = true;
  errorMessage.value = '';

  const studentNames = studentsText.value.split('\n').map(name => name.trim()).filter(name => name);

  const payload = {
    name: editableClass.value.name,
    program_name: editableClass.value.program_name,
    students: studentNames, 
  };

  try {
    if (props.isEditing) {
      await apiClient.put(`/classes/${editableClass.value.id}`, payload);
    } else {
      await apiClient.post('/classes', payload);
    }
    emit('class-saved');
    closeModal();
  } catch (error) {
    if (error.response && error.response.data && error.response.data.msg) {
      errorMessage.value = error.response.data.msg; // Backend message
    } else {
      errorMessage.value = `Error ${props.isEditing ? 'updating' : 'creating'} class.`; // Translated
    }
    console.error('Class form error:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>