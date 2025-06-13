<template>
  <div class="dashboard-view">
    <!-- Секция Классов -->
    <div class="mb-12">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-4xl font-bold text-gray-800">My Classes</h1>
      </div>

      <div v-if="isClassesLoading" class="text-center py-10">
        <p class="text-gray-500 text-lg">Loading classes...</p>
      </div>
      <div v-else-if="classesError" class="text-center py-10">
        <p class="text-red-500 text-lg">Error loading classes: {{ classesError }}</p>
      </div>
      
      <div ref="classesContainer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Список существующих классов -->
        <ClassCard
          v-for="classItem in classes"
          :key="classItem.id"
          :class-item="classItem"
          @view-details="viewClassDetails"
          @edit-class="openEditClassModal"
          @delete-class="confirmDeleteClass"
        />
        <!-- Карточка для добавления нового класса -->
        <div
          @click="openCreateClassModal"
          class="h-full flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-lg border-2 border-dashed border-gray-300 cursor-pointer text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-all duration-300 transform hover:scale-105 ignore-sort"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span class="mt-2 font-semibold">Add New Class</span>
        </div>
      </div>
    </div>

    <!-- Разделитель -->
    <hr class="my-16 border-t-2 border-gray-200">

    <!-- Секция Программ -->
    <div>
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-4xl font-bold text-gray-800">My Programs</h1>
      </div>

       <div v-if="isProgramsLoading" class="text-center py-10">
        <p class="text-gray-500 text-lg">Loading programs...</p>
      </div>
      <div v-else-if="programsError" class="text-center py-10">
        <p class="text-red-500 text-lg">Error loading programs: {{ programsError }}</p>
      </div>
      <div ref="programsContainer" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Список существующих программ -->
        <ProgramCard
          v-for="programItem in programs"
          :key="programItem.id"
          :program="programItem"
          @view-details="viewProgramDetails"
          @edit-program="openEditProgramModal"
          @delete-program="confirmDeleteProgram"
        />
        <!-- Карточка для добавления новой программы -->
         <div
          @click="openCreateProgramModal"
          class="h-full flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-lg border-2 border-dashed border-gray-300 cursor-pointer text-gray-500 hover:border-green-500 hover:text-green-600 transition-all duration-300 transform hover:scale-105 ignore-sort"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span class="mt-2 font-semibold">Add New Program</span>
        </div>
      </div>
    </div>

    <!-- Модальные окна для Классов -->
    <ClassForm
      v-if="showClassModal"
      :is-editing="isEditingClass"
      :class-to-edit="classToEdit"
      @close="closeClassModal"
      @class-saved="handleClassSaved"
    />
    <div v-if="showDeleteConfirmModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 class="text-xl font-semibold mb-4">Confirm Deletion</h3>
            <p class="mb-6">Are you sure you want to delete the class "{{ classToDelete?.name }}"? This action cannot be undone.</p>
            <div class="flex justify-end space-x-3">
                <button @click="showDeleteConfirmModal = false" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                <button @click="deleteClass" class="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700">Delete</button>
            </div>
        </div>
    </div>

    <!-- Модальные окна для Программ -->
    <ProgramForm
      v-if="showProgramModal"
      :is-editing="isEditingProgram"
      :program-to-edit="programToEdit"
      @close="closeProgramModal"
      @program-saved="handleProgramSaved"
    />
    <div v-if="showProgramDeleteConfirmModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 class="text-xl font-semibold mb-4">Confirm Deletion</h3>
            <p class="mb-6">Are you sure you want to delete the program "{{ programToDelete?.name }}"? This action cannot be undone and will delete all associated lessons.</p>
            <div class="flex justify-end space-x-3">
                <button @click="showProgramDeleteConfirmModal = false" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                <button @click="deleteProgram" class="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700">Delete</button>
            </div>
        </div>
    </div>

  </div>
</template>

<script setup>
// ... (скрипт остается таким же, как в предыдущей версии, вся логика уже на месте)
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../services/api';
import Sortable from 'sortablejs';

import ClassCard from '../components/ClassCard.vue';
import ClassForm from '../components/ClassForm.vue';
import ProgramCard from '../components/ProgramCard.vue';
import ProgramForm from '../components/ProgramForm.vue';

const router = useRouter();

// === State for Classes ===
const classes = ref([]);
const classesContainer = ref(null);
const isClassesLoading = ref(true);
const classesError = ref(null);
const showClassModal = ref(false);
const isEditingClass = ref(false);
const classToEdit = ref(null);
const showDeleteConfirmModal = ref(false);
const classToDelete = ref(null);

// === State for Programs ===
const programs = ref([]);
const programsContainer = ref(null);
const isProgramsLoading = ref(true);
const programsError = ref(null);
const showProgramModal = ref(false);
const isEditingProgram = ref(false);
const programToEdit = ref(null);
const showProgramDeleteConfirmModal = ref(false);
const programToDelete = ref(null);

// === Data Fetching ===
const fetchClasses = async () => {
  isClassesLoading.value = true;
  classesError.value = null;
  try {
    const response = await apiClient.get('/classes');
    classes.value = response.data;
  } catch (err) {
    console.error('Failed to fetch classes:', err);
    classesError.value = err.response?.data?.msg || 'Failed to load classes';
  } finally {
    isClassesLoading.value = false;
  }
};

const fetchPrograms = async () => {
  isProgramsLoading.value = true;
  programsError.value = null;
  try {
    const response = await apiClient.get('/programs');
    programs.value = response.data;
  } catch (err) {
    console.error('Failed to fetch programs:', err);
    programsError.value = err.response?.data?.msg || 'Failed to load programs';
  } finally {
    isProgramsLoading.value = false;
  }
};

onMounted(() => {
    Promise.all([fetchClasses(), fetchPrograms()]);
});

watch(classesContainer, (newEl) => {
    if (newEl) {
        new Sortable(newEl, {
            animation: 150,
            handle: '.drag-handle',
            filter: '.ignore-sort',
            onMove: function (evt) {
              // Запрещаем "приземляться" на карточку добавления
              // evt.related - это элемент, НАД которым мы сейчас тащим
              return evt.related.className.indexOf('ignore-sort') === -1;
            },
            onEnd: handleClassDragEnd,
        });
    }
});

// Инициализация Sortable для Программ
watch(programsContainer, (newEl) => {
    if (newEl) {
        new Sortable(newEl, {
            animation: 150,
            handle: '.drag-handle',
            filter: '.ignore-sort',
            onMove: function (evt) {
              // Запрещаем "приземляться" на карточку добавления
              // evt.related - это элемент, НАД которым мы сейчас тащим
              return evt.related.className.indexOf('ignore-sort') === -1;
            },
            onEnd: handleProgramDragEnd,
        });
    }
});

// Обработчик перетаскивания для Классов
const handleClassDragEnd = (evt) => {
    const item = classes.value.splice(evt.oldIndex, 1)[0];
    classes.value.splice(evt.newIndex, 0, item);
    saveNewClassOrder();
};

// Обработчик перетаскивания для Программ
const handleProgramDragEnd = (evt) => {
    const item = programs.value.splice(evt.oldIndex, 1)[0];
    programs.value.splice(evt.newIndex, 0, item);
    saveNewProgramOrder();
};

// Сохранение нового порядка Классов на сервере
const saveNewClassOrder = async () => {
    const ordered_ids = classes.value.map(c => c.id);
    try {
        await apiClient.post('/classes/update-order', { ordered_ids });
    } catch (err) {
        console.error('Failed to save class order:', err);
        classesError.value = "Could not save order. Please refresh.";
        fetchClasses(); // В случае ошибки, перезагружаем с сервера
    }
};

// Сохранение нового порядка Программ на сервере
const saveNewProgramOrder = async () => {
    const ordered_ids = programs.value.map(p => p.id);
    try {
        await apiClient.post('/programs/update-order', { ordered_ids });
    } catch (err) {
        console.error('Failed to save program order:', err);
        programsError.value = "Could not save order. Please refresh.";
        fetchPrograms(); // В случае ошибки, перезагружаем с сервера
    }
};

// === Methods for Classes ===
const viewClassDetails = (classId) => {
  router.push({ name: 'ClassDetail', params: { id: classId } });
};
const openCreateClassModal = () => {
  isEditingClass.value = false;
  classToEdit.value = null; 
  showClassModal.value = true;
};
const openEditClassModal = async (classItem) => {
  classToEdit.value = { ...classItem };
  isEditingClass.value = true;
  showClassModal.value = true;
};
const closeClassModal = () => {
  showClassModal.value = false;
  classToEdit.value = null;
};
const handleClassSaved = () => {
  fetchClasses(); 
};
const confirmDeleteClass = (classId) => {
    classToDelete.value = classes.value.find(c => c.id === classId);
    showDeleteConfirmModal.value = true;
};
const deleteClass = async () => {
  if (!classToDelete.value) return;
  try {
    await apiClient.delete(`/classes/${classToDelete.value.id}`);
    fetchClasses(); 
  } catch (err) {
    console.error('Failed to delete class:', err);
    classesError.value = err.response?.data?.msg || 'Failed to delete class';
  } finally {
    showDeleteConfirmModal.value = false;
    classToDelete.value = null;
  }
};

// === Methods for Programs ===
const viewProgramDetails = (programId) => {
  router.push({ name: 'ProgramDetail', params: { id: programId } });
};
const openCreateProgramModal = () => {
  isEditingProgram.value = false;
  programToEdit.value = null;
  showProgramModal.value = true;
};
const openEditProgramModal = (programItem) => {
  programToEdit.value = { ...programItem };
  isEditingProgram.value = true;
  showProgramModal.value = true;
};
const closeProgramModal = () => {
  showProgramModal.value = false;
  programToEdit.value = null;
};
const handleProgramSaved = () => {
  fetchPrograms();
};
const confirmDeleteProgram = (programId) => {
    programToDelete.value = programs.value.find(p => p.id === programId);
    showProgramDeleteConfirmModal.value = true;
};
const deleteProgram = async () => {
  if (!programToDelete.value) return;
  try {
    await apiClient.delete(`/programs/${programToDelete.value.id}`);
    fetchPrograms();
    fetchClasses();
  } catch (err) {
    console.error('Failed to delete program:', err);
    programsError.value = err.response?.data?.msg || 'Failed to delete program';
  } finally {
    showProgramDeleteConfirmModal.value = false;
    programToDelete.value = null;
  }
};
</script>