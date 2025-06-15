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
      <div class="mb-4">
        <router-link to="/" class="text-blue-600 hover:text-blue-800 font-medium transition duration-150 ease-in-out inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"></path></svg>
            <span>Back</span>
        </router-link>
      </div>
      
      <div class="mb-6 pb-4 border-b border-gray-200">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{{ classData.name }}</h1>
          <p v-if="classData.program_name" class="text-gray-600 text-md">
            Assigned Program: {{ classData.program_name }}
          </p>
          <p v-else class="text-gray-500 text-md italic">No program assigned to this class.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div>
          <h2 class="text-2xl font-semibold text-gray-700 mb-4">Program Lessons</h2>
          <div v-if="sortedProgramLessons && sortedProgramLessons.length > 0" class="bg-gray-50 p-4 rounded-md">
            <ul class="space-y-2">
              <li v-for="lesson in sortedProgramLessons" :key="lesson.id" class="p-3 bg-white rounded shadow-sm border border-gray-200 hover:bg-gray-50">
                <router-link :to="{ name: 'LessonProgress', params: { classId: classData.id, lessonId: lesson.id }}" class="font-medium text-blue-600 hover:text-blue-800">
                  {{ lesson.topic }}
                </router-link>
              </li>
            </ul>
          </div>
          <p v-else class="text-gray-500 italic">No lessons in the assigned program.</p>
        </div>

        <div>
          <h2 class="text-2xl font-semibold text-gray-700 mb-4">Student List ({{ classData.students.length }})</h2>
          <div v-if="classData.students && classData.students.length > 0" class="bg-gray-50 p-4 rounded-md">
            <ul ref="studentsContainer" class="space-y-3">
              <li
                v-for="student in classData.students"
                :key="student.id"
                class="student-item group flex items-center p-2 bg-white rounded shadow-sm border border-gray-200"
              >
                <svg class="h-5 w-5 text-gray-400 cursor-move mr-3 drag-handle flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                <span class="flex-grow text-gray-800">{{ student.name }}</span>
                <button @click="openEditStudentModal(student)" class="ml-3 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" aria-label="Edit student">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
                  </svg>
                </button>
                <button @click="confirmDeleteStudent(student)" class="ml-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" aria-label="Delete student">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd" />
                  </svg>
                </button>
              </li>
            </ul>
          </div>
          <p v-else class="text-gray-500 italic mt-4">No students in this class yet.</p>

          <div class="mt-4">
            <button @click="openCreateStudentModal" class="w-full flex items-center justify-center p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Student
            </button>
          </div>
        </div>

      </div>

      <div class="mt-8 pt-6 border-t border-gray-200">
        </div>
    </div>

    <StudentForm
      v-if="showStudentModal"
      :is-editing="isEditingStudent"
      :student-to-edit="studentToEdit"
      :class-id="classData.id"
      @close="closeStudentModal"
      @student-saved="handleStudentSaved"
    />

    <div v-if="showDeleteConfirmModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 class="text-xl font-semibold mb-4">Confirm Deletion</h3>
        <p class="mb-6">Are you sure you want to delete the student "{{ studentToDelete?.name }}"? This action cannot be undone.</p>
        <div class="flex justify-end space-x-3">
          <button @click="showDeleteConfirmModal = false" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
          <button @click="deleteStudent" class="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import apiClient from '../services/api';
import Sortable from 'sortablejs';
import StudentForm from '../components/StudentForm.vue';

const props = defineProps({
  id: { type: [String, Number], required: true },
});

const classData = ref(null);
const isLoading = ref(true);
const error = ref(null);

const studentsContainer = ref(null);
const showDeleteConfirmModal = ref(false);
const studentToDelete = ref(null);

const showStudentModal = ref(false);
const isEditingStudent = ref(false);
const studentToEdit = ref(null);

const fetchClassDetails = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await apiClient.get(`/classes/${props.id}`);
    classData.value = response.data;
  } catch (err) {
    console.error(`Failed to fetch class details for id ${props.id}:`, err);
    error.value = err.response?.data?.msg || err.message || 'Failed to load class data';
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchClassDetails);

const openCreateStudentModal = () => {
  isEditingStudent.value = false;
  studentToEdit.value = null;
  showStudentModal.value = true;
};

const openEditStudentModal = (student) => {
  isEditingStudent.value = true;
  studentToEdit.value = { ...student };
  showStudentModal.value = true;
};

const closeStudentModal = () => {
  showStudentModal.value = false;
};

const handleStudentSaved = () => {
  fetchClassDetails();
  closeStudentModal();
};

watch(studentsContainer, (newEl) => {
  if (newEl) {
    new Sortable(newEl, {
      animation: 150,
      handle: '.drag-handle',
      ghostClass: 'sortable-ghost',
      onEnd: handleStudentDragEnd,
    });
  }
});

const handleStudentDragEnd = (evt) => {
  const student = classData.value.students.splice(evt.oldIndex, 1)[0];
  classData.value.students.splice(evt.newIndex, 0, student);
  saveNewStudentOrder();
};

const saveNewStudentOrder = async () => {
  const ordered_ids = classData.value.students.map(s => s.id);
  try {
    await apiClient.post(`/classes/${props.id}/update-student-order`, { ordered_ids });
  } catch (err) {
    console.error('Failed to save student order:', err);
    error.value = "Could not save student order. Reverting changes.";
    fetchClassDetails();
  }
};

const confirmDeleteStudent = (student) => {
  studentToDelete.value = student;
  showDeleteConfirmModal.value = true;
};

const deleteStudent = async () => {
  if (!studentToDelete.value) return;
  try {
    await apiClient.delete(`/students/${studentToDelete.value.id}`);
    const index = classData.value.students.findIndex(s => s.id === studentToDelete.value.id);
    if (index > -1) {
      classData.value.students.splice(index, 1);
    }
  } catch (err) {
    console.error(`Failed to delete student ${studentToDelete.value.id}:`, err);
    error.value = err.response?.data?.msg || 'Failed to delete student.';
  } finally {
    showDeleteConfirmModal.value = false;
    studentToDelete.value = null;
  }
};

const sortedProgramLessons = computed(() => {
  if (classData.value?.program_details?.lessons) {
    return [...classData.value.program_details.lessons].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
  }
  return [];
});
</script>

<style>
.sortable-ghost {
  opacity: 0.4;
  background: #c8ebfb;
}
.drag-handle {
  cursor: move;
}
</style>