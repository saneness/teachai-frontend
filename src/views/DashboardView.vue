<template>
  <div class="dashboard">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-4xl font-bold text-gray-800">My Classes</h1> <!-- Translated -->
      <button
        @click="openCreateClassModal"
        class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-150 ease-in-out"
      >
        Create Class <!-- Translated -->
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-10">
      <p class="text-gray-500 text-lg">Loading classes...</p> <!-- Translated -->
    </div>
    <div v-else-if="error" class="text-center py-10">
      <p class="text-red-500 text-lg">Error loading classes: {{ error }}</p> <!-- Translated -->
    </div>
    <div v-else-if="classes.length === 0" class="text-center py-10">
      <p class="text-gray-500 text-lg">You don't have any classes yet. Create a new one!</p> <!-- Translated -->
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ClassCard
        v-for="classItem in classes"
        :key="classItem.id"
        :class-item="classItem"
        @view-details="viewClassDetails"
        @edit-class="openEditClassModal"
        @delete-class="confirmDeleteClass"
      />
    </div>

    <ClassForm
      v-if="showClassModal"
      :is-editing="isEditingClass"
      :class-to-edit="classToEdit"
      @close="closeClassModal"
      @class-saved="handleClassSaved"
    />

    <div v-if="showDeleteConfirmModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 class="text-xl font-semibold mb-4">Confirm Deletion</h3> <!-- Translated -->
            <p class="mb-6">Are you sure you want to delete the class "{{ classToDelete?.name }}"? This action cannot be undone.</p> <!-- Translated -->
            <div class="flex justify-end space-x-3">
                <button @click="showDeleteConfirmModal = false" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button> <!-- Translated -->
                <button @click="deleteClass" class="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700">Delete</button> <!-- Translated -->
            </div>
        </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../services/api';
import ClassCard from '../components/ClassCard.vue';
import ClassForm from '../components/ClassForm.vue';

const classes = ref([]);
const isLoading = ref(true);
const error = ref(null);
const router = useRouter();

const showClassModal = ref(false);
const isEditingClass = ref(false);
const classToEdit = ref(null);

const showDeleteConfirmModal = ref(false);
const classToDelete = ref(null);


const fetchClasses = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await apiClient.get('/classes');
    classes.value = response.data;
  } catch (err) {
    console.error('Failed to fetch classes:', err);
    error.value = err.response?.data?.msg || err.message || 'Failed to load classes'; // Translated
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchClasses);

const viewClassDetails = (classId) => {
  router.push({ name: 'ClassDetail', params: { id: classId } });
};

const openCreateClassModal = () => {
  isEditingClass.value = false;
  classToEdit.value = null; 
  showClassModal.value = true;
};

const openEditClassModal = async (classItem) => {
  isLoading.value = true;
  try {
    const response = await apiClient.get(`/classes/${classItem.id}`);
    classToEdit.value = response.data; 
    isEditingClass.value = true;
    showClassModal.value = true;
  } catch (err) {
    console.error('Failed to fetch class details for editing:', err);
    error.value = 'Failed to load class data for editing.'; // Translated
  } finally {
    isLoading.value = false;
  }
};

const closeClassModal = () => {
  showClassModal.value = false;
  classToEdit.value = null;
};

const handleClassSaved = () => {
  fetchClasses(); 
};

const confirmDeleteClass = (classItemOrId) => {
    if (typeof classItemOrId === 'object' && classItemOrId !== null) {
        classToDelete.value = classItemOrId;
    } else {
        classToDelete.value = classes.value.find(c => c.id === classItemOrId) || { id: classItemOrId, name: `ID: ${classItemOrId}`};
    }
    showDeleteConfirmModal.value = true;
};

const deleteClass = async () => {
  if (!classToDelete.value) return;
  isLoading.value = true; 
  try {
    await apiClient.delete(`/classes/${classToDelete.value.id}`);
    fetchClasses(); 
  } catch (err) {
    console.error('Failed to delete class:', err);
    error.value = err.response?.data?.msg || 'Failed to delete class'; // Translated
  } finally {
    isLoading.value = false;
    showDeleteConfirmModal.value = false;
    classToDelete.value = null;
  }
};
</script>