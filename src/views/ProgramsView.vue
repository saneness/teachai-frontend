<template>
  <div class="programs-dashboard">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-4xl font-bold text-gray-800">My Programs</h1>
      <button
        @click="openCreateProgramModal"
        class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-150 ease-in-out"
      >
        Create Program
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-10">
      <p class="text-gray-500 text-lg">Loading programs...</p>
    </div>
    <div v-else-if="error" class="text-center py-10">
      <p class="text-red-500 text-lg">Error loading programs: {{ error }}</p>
    </div>
    <div v-else-if="programs.length === 0" class="text-center py-10">
      <p class="text-gray-500 text-lg">You don't have any programs yet. Create a new one!</p>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ProgramCard
        v-for="programItem in programs"
        :key="programItem.id"
        :program="programItem"
        @view-details="viewProgramDetails"
        @edit-program="openEditProgramModal"
        @delete-program="confirmDeleteProgram"
      />
    </div>

    <ProgramForm
      v-if="showProgramModal"
      :is-editing="isEditingProgram"
      :program-to-edit="programToEdit"
      @close="closeProgramModal"
      @program-saved="handleProgramSaved"
    />

    <div v-if="showDeleteConfirmModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 class="text-xl font-semibold mb-4">Confirm Deletion</h3>
            <p class="mb-6">Are you sure you want to delete the program "{{ programToDelete?.name }}"? This action cannot be undone and will delete all associated lessons.</p>
            <div class="flex justify-end space-x-3">
                <button @click="showDeleteConfirmModal = false" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                <button @click="deleteProgram" class="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700">Delete</button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../services/api';
import ProgramCard from '../components/ProgramCard.vue';
import ProgramForm from '../components/ProgramForm.vue';

const programs = ref([]);
const isLoading = ref(true);
const error = ref(null);
const router = useRouter();

const showProgramModal = ref(false);
const isEditingProgram = ref(false);
const programToEdit = ref(null);

const showDeleteConfirmModal = ref(false);
const programToDelete = ref(null);

const fetchPrograms = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await apiClient.get('/programs');
    programs.value = response.data;
  } catch (err) {
    console.error('Failed to fetch programs:', err);
    if (err.response && err.response.data && err.response.data.msg) {
      error.value = err.response.data.msg;
    } else if (err.request) {
      error.value = 'Network Error: Could not connect to the server.';
    } else {
      error.value = 'Failed to load programs';
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchPrograms);

const viewProgramDetails = (programId) => {
  router.push({ name: 'ProgramDetail', params: { id: programId } });
};

const openCreateProgramModal = () => {
  isEditingProgram.value = false;
  programToEdit.value = null;
  showProgramModal.value = true;
};

const openEditProgramModal = (programItem) => {
  // Для простоты формы редактирования программы, мы пока не будем загружать уроки сюда.
  // Уроки будут управляться на странице деталей программы.
  programToEdit.value = { ...programItem }; // Копируем, чтобы избежать прямой мутации
  isEditingProgram.value = true;
  showProgramModal.value = true;
};

const closeProgramModal = () => {
  showProgramModal.value = false;
  programToEdit.value = null;
};

const handleProgramSaved = () => {
  fetchPrograms(); // Перезагружаем список программ
};

const confirmDeleteProgram = (programItemOrId) => {
    if (typeof programItemOrId === 'object' && programItemOrId !== null) {
        programToDelete.value = programItemOrId;
    } else {
        programToDelete.value = programs.value.find(p => p.id === programItemOrId) || { id: programItemOrId, name: `ID: ${programItemOrId}`};
    }
    showDeleteConfirmModal.value = true;
};

const deleteProgram = async () => {
  if (!programToDelete.value) return;
  // Можно добавить isLoading для операции удаления
  try {
    await apiClient.delete(`/programs/${programToDelete.value.id}`);
    fetchPrograms(); // Обновляем список
  } catch (err) {
    console.error('Failed to delete program:', err);
     if (err.response && err.response.data && err.response.data.msg) {
      error.value = err.response.data.msg;
    } else if (err.request) {
      error.value = 'Network Error: Could not connect to the server.';
    } else {
      error.value = 'Failed to delete program';
    }
  } finally {
    showDeleteConfirmModal.value = false;
    programToDelete.value = null;
  }
};
</script>