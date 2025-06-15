<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50" @click.self="handleBackdropClick">
    <div class="relative bg-white p-8 rounded-lg shadow-xl w-full max-w-lg mx-auto">
      <button @click="handleBackdropClick" class="absolute top-0 right-0 mt-4 mr-4 text-gray-600 hover:text-gray-800">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
      <h2 class="text-2xl font-bold text-gray-800 mb-6">{{ isEditing ? 'Edit Class' : 'Create New Class' }}</h2>
      <form @submit.prevent="submitForm">
        <div class="mb-4">
          <label for="className" class="block text-gray-700 text-sm font-semibold mb-2">Class Name:</label>
          <input type="text" id="className" v-model="editableClass.name" required class="shadow-sm appearance-none bg-white border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"/>
        </div>

        <div class="mb-4">
          <label for="programName" class="block text-gray-700 text-sm font-semibold mb-2">Program:</label>
          <div>
            <select id="programName" :value="editableClass.program_name" @change="onProgramChange($event)" class="shadow-sm appearance-none bg-white border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed" :disabled="isProgramsLoading || availablePrograms.length === 0" required>
              <option v-if="isProgramsLoading" :value="null" disabled>Loading programs...</option>
              <option v-else-if="availablePrograms.length === 0" :value="null" disabled>No programs available. Create one first.</option>
              <option v-if="!isEditing && !isProgramsLoading && availablePrograms.length > 0 && editableClass.program_name === null" :value="null" disabled>Please select a program</option>
              <option v-for="program in availablePrograms" :key="program.id" :value="program.name">{{ program.name }}</option>
            </select>
            <p v-if="!isEditing && availablePrograms.length === 0 && !isProgramsLoading" class="text-xs text-red-500 mt-1">You need to create a program before you can assign it to a class.</p>
          </div>
        </div>

        <div v-if="!isEditing" class="mb-6">
          <label for="students" class="block text-gray-700 text-sm font-semibold mb-2">Students (one name per line):</label>
          <textarea id="students" v-model="studentsText" rows="5" class="shadow-sm appearance-none bg-white border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="John Doe&#10;Jane Smith&#10;Peter Jones"></textarea>
        </div>
        
        <div v-if="formError" class="mb-4 text-red-500 text-sm">{{ formError }}</div>

        <div class="flex justify-end space-x-3">
          <button type="button" @click="handleBackdropClick" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400">Cancel</button>
          <button type="submit" :disabled="isLoading || (!isEditing && (isProgramsLoading || availablePrograms.length === 0 || !editableClass.program_name))" class="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50">
            <span v-if="isLoading">Saving...</span><span v-else>{{ isEditing ? 'Save Changes' : 'Create Class' }}</span>
          </button>
        </div>
      </form>
    </div>
    
    <div v-if="showProgramChangeConfirmModal" class="fixed inset-0 bg-gray-900 bg-opacity-60 overflow-y-auto h-full w-full flex justify-center items-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 class="text-xl font-semibold text-yellow-600 mb-4">Warning: Change Program</h3>
            <p class="mb-6 text-gray-700">Changing the program will permanently delete all current progress (comments, uploaded work) for all students in this class. <br><br>Are you sure you want to continue?</p>
            <div class="flex justify-end space-x-3">
                <button @click="cancelProgramChange" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                <button @click="confirmProgramChange" class="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700">Yes, Change Program</button>
            </div>
        </div>
    </div>
    <div v-if="showDiscardConfirmModal" class="fixed inset-0 bg-gray-900 bg-opacity-60 overflow-y-auto h-full w-full flex justify-center items-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 class="text-xl font-semibold text-yellow-600 mb-4">Unsaved Changes</h3>
            <p class="mb-6 text-gray-700">You have unsaved changes. Are you sure you want to close and discard them?</p>
            <div class="flex justify-end space-x-3">
                <button @click="cancelDiscard" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                <button @click="confirmDiscard" class="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700">Discard Changes</button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'; 
import apiClient from '../services/api';

const props = defineProps({
  classToEdit: { type: Object, default: null },
  isEditing: { type: Boolean, default: false },
});
const emit = defineEmits(['close', 'class-saved']);

const editableClass = ref({ id: null, name: '', program_name: null });
const studentsText = ref('');
const formError = ref('');
const isLoading = ref(false);
const availablePrograms = ref([]);
const isProgramsLoading = ref(false);

const originalProgramName = ref(null);
const showProgramChangeConfirmModal = ref(false);
const pendingProgramChange = ref(null);

const initialFormState = ref('');
const showDiscardConfirmModal = ref(false);

const isFormDirty = computed(() => {
    if (initialFormState.value === '') return false;
    const currentState = JSON.stringify({
        name: editableClass.value.name,
        program_name: editableClass.value.program_name,
        students: studentsText.value,
    });
    return initialFormState.value !== currentState;
});

const captureInitialState = () => {
    initialFormState.value = JSON.stringify({
        name: editableClass.value.name,
        program_name: editableClass.value.program_name,
        students: studentsText.value,
    });
};

const fetchAvailablePrograms = async () => {
  isProgramsLoading.value = true;
  try {
    const response = await apiClient.get('/programs');
    availablePrograms.value = response.data;
  } catch (error) {
    console.error("Failed to fetch programs:", error);
    formError.value = "Could not load available programs.";
  } finally {
    isProgramsLoading.value = false;
  }
};

onMounted(async () => { 
  await fetchAvailablePrograms(); 
  if (props.isEditing && props.classToEdit) {
    editableClass.value = { ...props.classToEdit };
    originalProgramName.value = props.classToEdit.program_name; 
  } else { 
    if (availablePrograms.value.length > 0) {
        editableClass.value.program_name = null;
    }
    editableClass.value.id = null;
    editableClass.value.name = '';
  }
  captureInitialState(); 
});

const onProgramChange = (event) => {
    const newProgramName = event.target.value;
    if (props.isEditing && newProgramName !== originalProgramName.value) {
        pendingProgramChange.value = newProgramName;
        showProgramChangeConfirmModal.value = true;
    } else {
        editableClass.value.program_name = newProgramName;
    }
};

const confirmProgramChange = () => {
    editableClass.value.program_name = pendingProgramChange.value;
    originalProgramName.value = pendingProgramChange.value; 
    cancelProgramChange();
};

const cancelProgramChange = () => {
    showProgramChangeConfirmModal.value = false;
    pendingProgramChange.value = null;
};

const closeForm = () => { emit('close'); };

const handleBackdropClick = () => {
  if (isFormDirty.value) { showDiscardConfirmModal.value = true; } 
  else { closeForm(); }
};

const confirmDiscard = () => {
  showDiscardConfirmModal.value = false;
  closeForm();
};

const cancelDiscard = () => {
  showDiscardConfirmModal.value = false;
};

const submitForm = async () => {
  formError.value = ''; 
  if (!editableClass.value.name.trim()) { formError.value = 'Class name is required.'; return; }
  if (!props.isEditing && !editableClass.value.program_name) { formError.value = 'Program selection is required.'; return; }
  if (!props.isEditing && availablePrograms.value.length === 0 && !isProgramsLoading.value) { formError.value = 'Cannot create class: No programs available.'; return; }

  isLoading.value = true;

  const payload = {
    name: editableClass.value.name,
    program_name: editableClass.value.program_name
  };
  
  if (!props.isEditing) {
    const studentNames = studentsText.value.split('\n').map(name => name.trim()).filter(name => name);
    payload.students = studentNames;
  }
  
  try {
    if (props.isEditing) {
      await apiClient.put(`/classes/${editableClass.value.id}`, payload);
    } else {
      await apiClient.post('/classes', payload);
    }
    captureInitialState(); 
    emit('class-saved');
    closeForm();
  } catch (error) {
    if (error.response?.data?.msg) { formError.value = error.response.data.msg; } 
    else if (error.request) { formError.value = 'Network Error: Could not connect to the server.'; } 
    else { formError.value = `Error ${props.isEditing ? 'updating' : 'creating'} class.`; }
    console.error('Class form error:', error);
  } finally {
    isLoading.value = false;
  }
};
</script>