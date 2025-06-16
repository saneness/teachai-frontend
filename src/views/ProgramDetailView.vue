<template>
  <div class="program-detail p-4 md:p-6 lg:p-8">
    <div v-if="isLoading" class="text-center py-10">
      <p class="text-gray-500 text-lg">Loading program data...</p>
    </div>
    <div v-else-if="error" class="text-center py-10">
      <p class="text-red-500 text-lg">Error: {{ error }}</p>
      <router-link to="/" class="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Back
      </router-link>
    </div>
    <div v-else-if="programData" class="bg-white p-6 rounded-lg shadow-xl">
      <div class="mb-4">
        <router-link to="/" class="text-blue-600 hover:text-blue-800 font-medium transition duration-150 ease-in-out inline-flex items-center">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"></path></svg>
           <span>Back</span>
        </router-link>
      </div>

      <div class="mb-6 pb-4 border-b border-gray-200">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-800">{{ programData.name }}</h1>
      </div>

      <div class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-700 mb-4">Program Resources</h2>
        
        <div v-if="programData.resources && programData.resources.length > 0" class="space-y-2 mb-4">
            <div v-for="resource in programData.resources" :key="resource.id" class="p-2 bg-gray-100 rounded border border-gray-200">
                <div class="flex justify-between items-center">
                    <a :href="getResourceDownloadUrl(resource.stored_filename)" target="_blank" class="text-blue-600 hover:underline font-medium text-sm" :download="resource.original_filename">{{ resource.original_filename }}</a>
                    <button @click="confirmDeleteResource(resource)" class="text-red-500 hover:text-red-700 ml-2 p-1 rounded hover:bg-red-100" title="Delete resource">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
                    </button>
                </div>
                <p v-if="resource.description" class="text-xs text-gray-600 mt-1 pl-1">{{ resource.description }}</p>
            </div>
        </div>
        <p v-else class="text-gray-500 italic mb-4">No resources uploaded for this program.</p>

        <div>
            <h4 class="text-md font-semibold text-gray-700 mb-2">Upload New Resource:</h4>
            <div class="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-2 md:items-center">
                <label for="resource-file-upload" class="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-200 rounded-md border border-gray-300 cursor-pointer hover:bg-gray-300">
                    <span>Choose file...</span>
                    <input type="file" id="resource-file-upload" @change="handleResourceFileUpload" class="hidden"/>
                </label>
                <input type="text" v-model="uploadState.description" placeholder="Optional description" class="flex-grow shadow-sm appearance-none bg-white border border-gray-300 rounded-lg w-full py-1.5 px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                <button @click="uploadResource" :disabled="!uploadState.file || isUploading" class="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 w-full md:w-auto">
                    <span v-if="isUploading">Uploading...</span>
                    <span v-else>Upload</span>
                </button>
            </div>
            <p v-if="uploadState.file" class="text-xs text-gray-500 mt-1 ml-1">Selected: {{ uploadState.file.name }}</p>
            <p v-if="uploadState.error" class="text-xs text-red-500 mt-1">{{ uploadState.error }}</p>
        </div>
      </div>

      <div class="mt-8 pt-6 border-t border-gray-200">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-semibold text-gray-700">Lessons ({{ sortedProgramLessons.length }})</h2>
             <button
              @click="openAddLessonModal"
              class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
            >
              Add Lesson
            </button>
          </div>

          <div v-if="sortedProgramLessons.length > 0" ref="lessonsContainer" class="space-y-4">
            <div v-for="lesson in sortedProgramLessons" :key="lesson.id" class="p-4 border rounded-md shadow-sm bg-gray-50 flex items-start space-x-3">
               <div class="drag-handle cursor-grab text-gray-400 hover:text-gray-600 pt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 1a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V4a3 3 0 00-3-3H5z" clip-rule="evenodd" fill-rule="evenodd"/>
                    <path d="M12 5a1 1 0 011 1v8a1 1 0 11-2 0V6a1 1 0 011-1zm-5 0a1 1 0 011 1v8a1 1 0 11-2 0V6a1 1 0 011-1z" />
                  </svg>
               </div>
               <div class="flex-grow">
                 <div class="flex justify-between items-start">
                   <div>
                     <h3 class="text-xl font-semibold text-gray-800">{{ lesson.topic }}</h3>
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
                 <p class="text-gray-600 mt-2 whitespace-pre-wrap text-sm">{{ lesson.description || 'No description.' }}</p>
               </div>
            </div>
          </div>
          <p v-else class="text-gray-500 italic mt-4">No lessons in this program yet. Add one to get started!</p>
      </div>

      <div class="mt-8 pt-6 border-t border-gray-200">
        <router-link to="/" class="text-blue-600 hover:text-blue-800 font-medium transition duration-150 ease-in-out inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"></path></svg>
            <span>Back</span>
        </router-link>
      </div>
    </div>

    <LessonForm
        v-if="showLessonModal"
        :program-id="programData.id"
        :lesson-to-edit="lessonToEdit"
        :is-editing="isEditingLesson"
        @close="closeLessonModal"
        @lesson-saved="handleLessonSaved"
    />
     <div v-if="showDeleteLessonConfirmModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 class="text-xl font-semibold mb-4">Confirm Lesson Deletion</h3>
            <p class="mb-6">Are you sure you want to delete the lesson "{{ lessonToDelete?.topic }}"?</p>
            <div class="flex justify-end space-x-3">
                <button @click="showDeleteLessonConfirmModal = false" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                <button @click="deleteLesson" class="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700">Delete</button>
            </div>
        </div>
    </div>

    <div v-if="showDeleteResourceConfirmModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 class="text-xl font-semibold mb-4">Confirm Resource Deletion</h3>
        <p class="mb-6">Are you sure you want to delete the file "{{ resourceToDelete?.original_filename }}"?</p>
        <div class="flex justify-end space-x-3">
          <button @click="showDeleteResourceConfirmModal = false" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
          <button @click="deleteResource" class="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, reactive } from 'vue';
import apiClient from '../services/api';
import LessonForm from '../components/LessonForm.vue';
import Sortable from 'sortablejs';

const props = defineProps({
  id: { type: [String, Number], required: true, },
});

const programData = ref({ lessons: [], resources: [] });
const isLoading = ref(true);
const error = ref(null);

const showLessonModal = ref(false);
const isEditingLesson = ref(false);
const lessonToEdit = ref(null);
const showDeleteLessonConfirmModal = ref(false);
const lessonToDelete = ref(null);

const lessonsContainer = ref(null);

const uploadState = reactive({
  file: null,
  description: '',
  error: '',
});
const isUploading = ref(false);

const showDeleteResourceConfirmModal = ref(false);
const resourceToDelete = ref(null);

const sortedProgramLessons = computed(() => {
  if (programData.value && programData.value.lessons) {
    return [...programData.value.lessons];
  }
  return [];
});

watch(lessonsContainer, (newValue) => {
    if (newValue) {
        new Sortable(newValue, {
            animation: 150,
            handle: '.drag-handle',
            onEnd: handleDragEnd,
        });
    }
});

const handleDragEnd = (evt) => {
    const item = programData.value.lessons.splice(evt.oldIndex, 1)[0];
    programData.value.lessons.splice(evt.newIndex, 0, item);
    saveNewLessonOrder();
};

const saveNewLessonOrder = async () => {
    const lessonIds = programData.value.lessons.map(lesson => lesson.id);
    try {
        await apiClient.put(`/programs/${props.id}/reorder_lessons`, {
            lesson_ids: lessonIds,
        });
    } catch (err) {
        console.error('Failed to save new lesson order:', err);
        error.value = "Could not save the new lesson order. Please refresh the page.";
    }
};

const fetchProgramDetails = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await apiClient.get(`/programs/${props.id}`);
    if (response.data.lessons) {
      response.data.lessons.sort((a,b) => (a.order ?? Infinity) - (b.order ?? Infinity));
    }
    programData.value = response.data;
  } catch (err) {
    console.error(`Failed to fetch program details for id ${props.id}:`, err);
    if (err.response?.status === 404) { error.value = 'Program not found.'; }
    else if (err.request) { error.value = 'Network Error: Could not connect to the server.'; } 
    else { error.value = err.response?.data?.msg || 'Failed to load program data'; }
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchProgramDetails);

// Функции для уроков
const openAddLessonModal = () => { isEditingLesson.value = false; lessonToEdit.value = null; showLessonModal.value = true; };
const openEditLessonModal = (lesson) => { lessonToEdit.value = { ...lesson }; isEditingLesson.value = true; showLessonModal.value = true; };
const closeLessonModal = () => { showLessonModal.value = false; lessonToEdit.value = null; };
const handleLessonSaved = () => { fetchProgramDetails(); };
const confirmDeleteLesson = (lesson) => { lessonToDelete.value = lesson; showDeleteLessonConfirmModal.value = true; };
const deleteLesson = async () => {
  if (!lessonToDelete.value) return;
  try { await apiClient.delete(`/lessons/${lessonToDelete.value.id}`); fetchProgramDetails(); } 
  catch (err) { console.error('Failed to delete lesson:', err); error.value = 'Failed to delete lesson.'; } 
  finally { showDeleteLessonConfirmModal.value = false; lessonToDelete.value = null; }
};

// Функции для ресурсов
const getResourceDownloadUrl = (storedFilename) => {
    return `${apiClient.defaults.baseURL}/program-resources/download/${storedFilename}?token=${localStorage.getItem('accessToken')}`;
};

const handleResourceFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        uploadState.file = file;
        uploadState.error = '';
    }
};

const uploadResource = async () => {
    if (!uploadState.file) return;
    isUploading.value = true;
    uploadState.error = '';
    const formData = new FormData();
    formData.append('file', uploadState.file);
    if (uploadState.description.trim()) {
        formData.append('description', uploadState.description.trim());
    }
    try {
        await apiClient.post(`/programs/${props.id}/upload_resource`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        const fileInput = document.getElementById('resource-file-upload');
        if (fileInput) fileInput.value = null;
        uploadState.file = null;
        uploadState.description = '';
        await fetchProgramDetails();
    } catch (err) {
        console.error('Failed to upload resource:', err);
        uploadState.error = err.response?.data?.msg || 'Failed to upload file.';
    } finally {
        isUploading.value = false;
    }
};

const confirmDeleteResource = (resource) => {
    resourceToDelete.value = resource;
    showDeleteResourceConfirmModal.value = true;
};

const deleteResource = async () => {
    if (!resourceToDelete.value) return;
    try {
        await apiClient.delete(`/program-resources/${resourceToDelete.value.id}`);
        await fetchProgramDetails();
    } catch (err) {
        console.error('Failed to delete resource:', err);
        error.value = err.response?.data?.msg || 'Failed to delete resource.';
    } finally {
        showDeleteResourceConfirmModal.value = false;
        resourceToDelete.value = null;
    }
};
</script>