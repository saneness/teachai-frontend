<template>
  <div class="student-progress-view p-4 md:p-6 lg:p-8">
    <div v-if="isLoading" class="text-center py-10">
      <p class="text-gray-500 text-lg">Loading student progress data...</p>
    </div>
    <div v-else-if="error" class="text-center py-10">
      <p class="text-red-500 text-lg">Error: {{ error }}</p>
      <router-link :to="{ name: 'ClassDetail', params: { id: classIdFromRoute }}" class="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Back to Class Details
      </router-link>
    </div>
    <div v-else-if="studentProgressData" class="bg-white p-6 rounded-lg shadow-xl">
      <!-- Информация о студенте и классе -->
      <div class="mb-6 pb-4 border-b border-gray-200">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-1">{{ studentProgressData.name }}</h1>
        <p class="text-gray-600 text-md">Class: {{ studentProgressData.class_name }}</p>
        <p v-if="studentProgressData.program" class="text-gray-500 text-sm">Program: {{ studentProgressData.program.name }}</p>
        <p v-else class="text-gray-500 text-sm italic">No program assigned to this student's class.</p>
      </div>

      <h2 class="text-2xl font-semibold text-gray-700 mb-6">Program Lessons, Comments & Work</h2>
      
      <div v-if="studentProgressData.program && studentProgressData.program.lessons && studentProgressData.program.lessons.length > 0" class="space-y-3">
        <div 
            v-for="lesson in sortedProgramLessons" 
            :key="lesson.id" 
            class="border rounded-md shadow-sm bg-gray-50 overflow-hidden"
        >
          <!-- Заголовок урока -->
          <div 
            @click="toggleLessonPanel(lesson.id)"
            class="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <div>
              <h3 class="text-xl font-semibold text-gray-800">{{ lesson.topic }}</h3>
              <p class="text-xs text-gray-400 mt-0.5">Order: {{ lesson.order === null ? 'N/A' : lesson.order }}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500 transition-transform duration-300" 
                 :class="{'rotate-180': activeLessonId === lesson.id}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          <!-- Раскрываемое содержимое урока -->
          <div v-if="activeLessonId === lesson.id" class="p-4 border-t bg-white">
            <!-- ИЗМЕНЕНИЕ: Добавлен класс whitespace-pre-wrap -->
            <p v-if="lesson.description" class="text-gray-700 mb-4 text-sm whitespace-pre-wrap">{{ lesson.description }}</p>
            <p v-else class="text-gray-500 italic mb-4 text-sm">No description for this lesson.</p>
            
            <!-- Комментарий учителя -->
            <div class="mb-4">
              <label :for="'comment-' + lesson.id" class="block text-sm font-medium text-gray-700 mb-1">Teacher's Comment:</label>
              <textarea
                :id="'comment-' + lesson.id"
                v-model="lessonComments[lesson.id]"
                rows="3"
                class="shadow-sm appearance-none bg-white border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add your comment here..."
              ></textarea>
              <button
                @click="saveComment(lesson.id)"
                :disabled="isSavingComment[lesson.id]"
                class="mt-2 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                <span v-if="isSavingComment[lesson.id]">Saving...</span>
                <span v-else>Save Comment</span>
              </button>
              <p v-if="commentErrors[lesson.id]" class="text-xs text-red-500 mt-1">{{ commentErrors[lesson.id] }}</p>
              <p v-if="commentSuccess[lesson.id]" class="text-xs text-green-500 mt-1">Comment saved!</p>
            </div>

            <!-- Загруженные работы студента -->
            <div class="border-t pt-4 mt-4">
              <h4 class="text-md font-semibold text-gray-700 mb-2">Student's Work:</h4>
              <div v-if="lesson.student_works && lesson.student_works.length > 0" class="space-y-2">
                <div v-for="work in lesson.student_works" :key="work.id" class="flex justify-between items-center p-2 bg-white rounded border border-gray-200">
                  <div>
                    <a :href="getWorkDownloadUrl(work.stored_filename)" 
                       target="_blank" 
                       class="text-blue-600 hover:underline font-medium"
                       :download="work.original_filename"
                       >
                       {{ work.original_filename }}
                    </a>
                    <span class="text-xs text-gray-500 ml-2">({{ work.file_type }})</span>
                    <p v-if="work.description" class="text-xs text-gray-500 mt-0.5">{{ work.description }}</p>
                  </div>
                  <button 
                    @click="confirmDeleteWork(work)"
                    class="text-red-500 hover:text-red-700 ml-2 p-1 rounded hover:bg-red-100"
                    title="Delete work"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                  </button>
                </div>
              </div>
              <p v-else class="text-sm text-gray-500 italic">No work uploaded for this lesson.</p>

              <!-- Форма загрузки файла -->
              <div class="mt-3">
                <label :for="'file-upload-' + lesson.id" class="block text-sm font-medium text-gray-700 mb-1">Upload New Work:</label>
                <input 
                  type="file" 
                  :id="'file-upload-' + lesson.id" 
                  @change="handleFileUpload($event, lesson.id)"
                  class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                 <input 
                  type="text" 
                  v-model="fileDescriptions[lesson.id]"
                  placeholder="Optional: Work description"
                  class="mt-1 shadow-sm appearance-none bg-white border border-gray-300 rounded-lg w-full py-1.5 px-3 text-sm text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                 />
                <button
                  @click="uploadWork(lesson.id)"
                  :disabled="!selectedFiles[lesson.id] || isUploadingWork[lesson.id]"
                  class="mt-2 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  <span v-if="isUploadingWork[lesson.id]">Uploading...</span>
                  <span v-else>Upload</span>
                </button>
                <p v-if="uploadErrors[lesson.id]" class="text-xs text-red-500 mt-1">{{ uploadErrors[lesson.id] }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="text-gray-500 italic">
        No lessons found for the assigned program, or no program is assigned to the class.
      </p>
      
      <div class="mt-8 pt-6 border-t border-gray-200">
        <router-link :to="{ name: 'ClassDetail', params: { id: classIdFromRoute }}" class="text-blue-600 hover:text-blue-800 font-medium transition duration-150 ease-in-out">
          &larr; Back to Class Details
        </router-link>
      </div>
    </div>

     <!-- Модальное окно подтверждения удаления работы -->
    <div v-if="showDeleteWorkConfirmModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 class="text-xl font-semibold mb-4">Confirm Work Deletion</h3>
            <p class="mb-6">Are you sure you want to delete the file "{{ workToDelete?.original_filename }}"?</p>
            <div class="flex justify-end space-x-3">
                <button @click="showDeleteWorkConfirmModal = false" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                <button @click="deleteWork" class="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700">Delete</button>
            </div>
        </div>
    </div>

  </div>
</template>

<script setup>
// ... (остальной скрипт без изменений)
import { ref, onMounted, reactive, computed } from 'vue';
import apiClient from '../services/api';
const props = defineProps({ studentId: { type: Number, required: true, }, classId: { type: Number, required: true, } });
const studentProgressData = ref(null); const isLoading = ref(true); const error = ref(null);
const lessonComments = reactive({}); const isSavingComment = reactive({}); const commentErrors = reactive({}); const commentSuccess = reactive({});
const selectedFiles = reactive({}); const fileDescriptions = reactive({}); const isUploadingWork = reactive({}); const uploadErrors = reactive({});   
const showDeleteWorkConfirmModal = ref(false); const workToDelete = ref(null);
const classIdFromRoute = computed(() => props.classId); 
const activeLessonId = ref(null);
const sortedProgramLessons = computed(() => {
  if (studentProgressData.value?.program?.lessons) {
    return [...studentProgressData.value.program.lessons].sort((a, b) => {
      if (a.order === null) return 1; if (b.order === null) return -1;
      return a.order - b.order;
    });
  }
  return [];
});
const fetchStudentProgress = async () => {
  isLoading.value = true; error.value = null;
  try {
    const response = await apiClient.get(`/students/${props.studentId}/progress`);
    studentProgressData.value = response.data;
    if (studentProgressData.value.program?.lessons) {
      studentProgressData.value.program.lessons.forEach(lesson => {
        lessonComments[lesson.id] = lesson.student_comment || ''; isSavingComment[lesson.id] = false;
        commentErrors[lesson.id] = ''; commentSuccess[lesson.id] = false; selectedFiles[lesson.id] = null;
        fileDescriptions[lesson.id] = ''; isUploadingWork[lesson.id] = false; uploadErrors[lesson.id] = '';
      });
    }
  } catch (err) {
    console.error(`Failed to fetch student progress for id ${props.studentId}:`, err);
    if (err.response) { error.value = err.response.data?.msg || `Error ${err.response.status}`; } 
    else if (err.request) { error.value = 'Network Error: Could not connect to the server.'; } 
    else { error.value = err.message || 'Failed to load student progress data'; }
  } finally { isLoading.value = false; }
};
onMounted(fetchStudentProgress);
const saveComment = async (lessonId) => {
  isSavingComment[lessonId] = true; commentErrors[lessonId] = ''; commentSuccess[lessonId] = false;
  try {
    await apiClient.post('/student-lesson-progress', {
      student_id: props.studentId, lesson_id: lessonId, comment: lessonComments[lessonId]
    });
    commentSuccess[lessonId] = true; setTimeout(() => commentSuccess[lessonId] = false, 3000); 
  } catch (err) {
    console.error(`Failed to save comment for lesson ${lessonId}:`, err);
    if (err.response?.data?.msg) { commentErrors[lessonId] = err.response.data.msg; } 
    else if (err.request) { commentErrors[lessonId] = 'Network Error. Could not save comment.'; }
    else { commentErrors[lessonId] = 'Failed to save comment.'; }
  } finally { isSavingComment[lessonId] = false; }
};
const handleFileUpload = (event, lessonId) => {
  const file = event.target.files[0];
  if (file) { selectedFiles[lessonId] = file; uploadErrors[lessonId] = ''; }
};
const uploadWork = async (lessonId) => {
  if (!selectedFiles[lessonId]) { uploadErrors[lessonId] = "Please select a file to upload."; return; }
  isUploadingWork[lessonId] = true; uploadErrors[lessonId] = '';
  const formData = new FormData();
  formData.append('file', selectedFiles[lessonId]);
  if(fileDescriptions[lessonId] && fileDescriptions[lessonId].trim() !== '') { formData.append('description', fileDescriptions[lessonId].trim()); }
  try {
    await apiClient.post(`/lessons/${lessonId}/students/${props.studentId}/upload_work`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    document.getElementById(`file-upload-${lessonId}`).value = null; 
    selectedFiles[lessonId] = null; fileDescriptions[lessonId] = '';
    fetchStudentProgress(); 
  } catch (err) {
    console.error(`Failed to upload work for lesson ${lessonId}:`, err);
    if (err.response?.data?.msg) { uploadErrors[lessonId] = err.response.data.msg; }
    else if (err.request) { uploadErrors[lessonId] = 'Network Error. Could not upload file.'; }
    else { uploadErrors[lessonId] = 'Failed to upload file.'; }
  } finally { isUploadingWork[lessonId] = false; }
};
const confirmDeleteWork = (work) => { workToDelete.value = work; showDeleteWorkConfirmModal.value = true; };
const deleteWork = async () => {
    if (!workToDelete.value) return;
    try { await apiClient.delete(`/student-works/${workToDelete.value.id}`); fetchStudentProgress(); } 
    catch (err) {
        console.error('Failed to delete work:', err);
        const lessonId = workToDelete.value.lesson_id; 
        if (err.response?.data?.msg) { uploadErrors[lessonId] = err.response.data.msg; }
        else if (err.request) { uploadErrors[lessonId] = 'Network Error.'; }
        else { uploadErrors[lessonId] = 'Failed to delete work.'; }
    } finally { showDeleteWorkConfirmModal.value = false; workToDelete.value = null; }
};
const getWorkDownloadUrl = (storedFilename) => {
    return `${apiClient.defaults.baseURL}/student-works/download/${storedFilename}?token=${localStorage.getItem('accessToken')}`;
};
const toggleLessonPanel = (lessonId) => {
  if (activeLessonId.value === lessonId) { activeLessonId.value = null; } 
  else { activeLessonId.value = lessonId; }
};
</script>