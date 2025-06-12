<template>
  <div class="student-progress-view p-4 md:p-6 lg:p-8">
    <div v-if="isLoading" class="text-center py-10">
      <p class="text-gray-500 text-lg">Loading student progress data...</p>
    </div>
    <div v-else-if="error" class="text-center py-10">
      <p class="text-red-500 text-lg">Error: {{ error }}</p>
      <router-link :to="{ name: 'ClassDetail', params: { id: classIdFromRoute }}" class="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Back
      </router-link>
    </div>
    <div v-else-if="studentProgressData" class="bg-white p-6 rounded-lg shadow-xl">
      <div class="mb-4">
        <router-link :to="{ name: 'ClassDetail', params: { id: classIdFromRoute }}" class="text-blue-600 hover:text-blue-800 font-medium transition duration-150 ease-in-out inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"></path></svg>
            <span>Back to Class</span>
        </router-link>
      </div>
      
      <div class="mb-6 pb-4 border-b border-gray-200">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-1">{{ studentProgressData.name }}</h1>
          <p class="text-gray-600 text-md">Class: {{ studentProgressData.class_name }}</p>
          <p v-if="studentProgressData.program" class="text-gray-500 text-sm">Program: {{ studentProgressData.program.name }}</p>
          <p v-else class="text-gray-500 text-sm italic">No program assigned to this student's class.</p>
      </div>

      <h2 class="text-2xl font-semibold text-gray-700 mb-6">Program Lessons & Feedback</h2>
      
      <div v-if="studentProgressData.program && studentProgressData.program.lessons && studentProgressData.program.lessons.length > 0" class="space-y-3">
        <div 
            v-for="lesson in sortedProgramLessons" 
            :key="lesson.id" 
            class="border rounded-md shadow-sm bg-gray-50 overflow-hidden"
        >
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
          
          <div v-if="activeLessonId === lesson.id" class="p-4 border-t bg-white">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="space-y-4">
                <div>
                  <h4 class="text-md font-semibold text-gray-700 mb-2">Classwork</h4>
                  <textarea :id="'classwork-comment-' + lesson.id" v-model="lessonProgress[lesson.id].classwork_comment" rows="3" class="shadow-sm appearance-none bg-white border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Add classwork feedback..."></textarea>
                  <div class="flex items-center space-x-3 mt-2">
                    <button @click="saveProgress(lesson.id, 'classwork')" :disabled="isSavingProgress[lesson.id]?.classwork" class="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">Save</button>
                    <p v-if="progressSuccess[lesson.id]?.classwork" class="text-xs text-green-500">Feedback saved!</p>
                  </div>
                  <div v-if="getClassworkFiles(lesson.id).length > 0" class="mt-3 space-y-2">
                    <div v-for="work in getClassworkFiles(lesson.id)" :key="work.id" class="flex justify-between items-center p-2 bg-gray-100 rounded border border-gray-200">
                        <div>
                          <a :href="getWorkDownloadUrl(work.stored_filename)" target="_blank" class="text-blue-600 hover:underline font-medium" :download="work.original_filename">{{ work.original_filename }}</a>
                          <span class="text-xs text-gray-500 ml-2">({{ work.file_type }})</span>
                          <p v-if="work.description" class="text-xs text-gray-500 mt-0.5">{{ work.description }}</p>
                        </div>
                        <button @click="confirmDeleteWork(work)" class="text-red-500 hover:text-red-700 ml-2 p-1 rounded hover:bg-red-100" title="Delete work">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                        </button>
                    </div>
                  </div>
                  <p v-else class="text-sm text-gray-400 italic mt-2">No classwork uploaded.</p>
                </div>

                <hr class="my-4" />

                <div>
                    <h4 class="text-md font-semibold text-gray-700 mb-2">Homework</h4>
                    <textarea :id="'homework-comment-' + lesson.id" v-model="lessonProgress[lesson.id].homework_comment" rows="3" class="shadow-sm appearance-none bg-white border border-gray-300 rounded-lg w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Add homework feedback..."></textarea>
                    <div class="flex items-center space-x-3 mt-2">
                      <button @click="saveProgress(lesson.id, 'homework')" :disabled="isSavingProgress[lesson.id]?.homework" class="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">Save</button>
                      <p v-if="progressSuccess[lesson.id]?.homework" class="text-xs text-green-500">Feedback saved!</p>
                    </div>
                    <div v-if="getHomeworkFiles(lesson.id).length > 0" class="mt-3 space-y-2">
                     <div v-for="work in getHomeworkFiles(lesson.id)" :key="work.id" class="flex justify-between items-center p-2 bg-gray-100 rounded border border-gray-200">
                        <div>
                          <a :href="getWorkDownloadUrl(work.stored_filename)" target="_blank" class="text-blue-600 hover:underline font-medium" :download="work.original_filename">{{ work.original_filename }}</a>
                          <span class="text-xs text-gray-500 ml-2">({{ work.file_type }})</span>
                          <p v-if="work.description" class="text-xs text-gray-500 mt-0.5">{{ work.description }}</p>
                        </div>
                        <button @click="confirmDeleteWork(work)" class="text-red-500 hover:text-red-700 ml-2 p-1 rounded hover:bg-red-100" title="Delete work">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                        </button>
                     </div>
                    </div>
                    <p v-else class="text-sm text-gray-400 italic mt-2">No homework uploaded.</p>
                </div>
                
                <p v-if="progressErrors[lesson.id]" class="text-xs text-red-500 mt-1">{{ progressErrors[lesson.id] }}</p>

                  <div class="border-t pt-4 mt-4">
                    <h4 class="text-md font-semibold text-gray-700 mb-2">Upload New Work:</h4>
                    <div v-if="uploadStates[lesson.id]">
                      <div class="flex items-center space-x-2">
                        <label :for="'file-upload-' + lesson.id" class="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-200 rounded-md border border-gray-300 cursor-pointer hover:bg-gray-300">
                            <span>Choose file...</span>
                            <input type="file" :id="'file-upload-' + lesson.id" @change="handleFileUpload($event, lesson.id)" class="hidden"/>
                        </label>
                        
                        <select 
                          v-model="uploadStates[lesson.id].workType" 
                          class="flex-shrink-0 shadow-sm appearance-none bg-white border border-gray-300 rounded-lg py-1.5 px-2 text-sm text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="classwork">Classwork</option>
                            <option value="homework">Homework</option>
                        </select>
                        
                        <input type="text" v-model="uploadStates[lesson.id].description" placeholder="Optional description" class="flex-grow shadow-sm appearance-none bg-white border border-gray-300 rounded-lg w-full py-1.5 px-3 text-sm text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                        
                        <button @click="uploadWork(lesson.id)" :disabled="!uploadStates[lesson.id].file || isUploadingWork" class="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50">
                          <span v-if="isUploadingWork">...</span>
                          <span v-else>Upload</span>
                        </button>
                      </div>
                      <p v-if="uploadStates[lesson.id].file" class="text-xs text-gray-500 mt-1 ml-1">Selected: {{ uploadStates[lesson.id].file.name }}</p>
                      <p v-if="uploadStates[lesson.id].error" class="text-xs text-red-500 mt-1">{{ uploadStates[lesson.id].error }}</p>
                    </div>
                  </div>
              </div>

              <div>
                  <h4 class="text-md font-semibold text-gray-700 mb-2">Lesson Details</h4>
                  <p v-if="lesson.description" class="text-gray-700 mb-4 text-sm whitespace-pre-wrap">{{ lesson.description }}</p>
                  <p v-else class="text-gray-500 italic mb-4 text-sm">No description for this lesson.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="text-gray-500 italic">No lessons found for the assigned program.</p>
      
      <div class="mt-8 pt-6 border-t border-gray-200">
        <router-link :to="{ name: 'ClassDetail', params: { id: classIdFromRoute }}" class="text-blue-600 hover:text-blue-800 font-medium transition duration-150 ease-in-out inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"></path></svg>
            <span>Back</span>
        </router-link>
      </div>
    </div>

    <div v-if="showDeleteWorkConfirmModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 class="text-xl font-semibold mb-4">Confirm Work Deletion</h3>
            <p class="mb-6">Are you sure you want to delete the file "{{ workToDelete?.original_filename }}"?</p>
            <div class="flex justify-end space-x-3">
                <button @click="showDeleteWorkConfirmModal = false" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                <button @click="performDeleteWork" class="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700">Delete</button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import apiClient from '../services/api';

const props = defineProps({ studentId: { type: Number, required: true, }, classId: { type: Number, required: true, } });
const studentProgressData = ref(null);
const isLoading = ref(true);
const error = ref(null);

const lessonProgress = reactive({}); 
const isSavingProgress = reactive({}); 
const progressErrors = reactive({});
const progressSuccess = reactive({}); 

const uploadStates = reactive({});
const isUploadingWork = ref(false);

const showDeleteWorkConfirmModal = ref(false);
const workToDelete = ref(null);
const classIdFromRoute = computed(() => props.classId);
const activeLessonId = ref(null);

const sortedProgramLessons = computed(() => {
  if (studentProgressData.value?.program?.lessons) {
    return [...studentProgressData.value.program.lessons].sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
  }
  return [];
});

const getClassworkFiles = (lessonId) => {
  const lesson = studentProgressData.value?.program?.lessons?.find(l => l.id === lessonId);
  return lesson?.student_works?.filter(w => w.work_type === 'classwork') || [];
};
const getHomeworkFiles = (lessonId) => {
  const lesson = studentProgressData.value?.program?.lessons?.find(l => l.id === lessonId);
  return lesson?.student_works?.filter(w => w.work_type === 'homework') || [];
};

const fetchStudentProgress = async () => {
  isLoading.value = true; error.value = null;
  try {
    const response = await apiClient.get(`/students/${props.studentId}/progress`);
    studentProgressData.value = response.data;
    if (studentProgressData.value.program?.lessons) {
      studentProgressData.value.program.lessons.forEach(lesson => {
        lessonProgress[lesson.id] = {
            classwork_comment: lesson.student_classwork_comment || '',
            homework_comment: lesson.student_homework_comment || ''
        };
        isSavingProgress[lesson.id] = { classwork: false, homework: false };
        progressErrors[lesson.id] = '';
        progressSuccess[lesson.id] = { classwork: false, homework: false };
      });
    }
  } catch (err) {
    console.error(`Failed to fetch student progress for id ${props.studentId}:`, err);
    error.value = err.response?.data?.msg || 'Failed to load student progress data';
  } finally { isLoading.value = false; }
};

onMounted(fetchStudentProgress);

const saveProgress = async (lessonId, commentType) => {
  isSavingProgress[lessonId][commentType] = true;
  progressErrors[lessonId] = '';
  progressSuccess[lessonId].classwork = false;
  progressSuccess[lessonId].homework = false;
  
  const payload = {
    student_id: props.studentId,
    lesson_id: lessonId,
  };
  if (commentType === 'classwork') {
    payload.classwork_comment = lessonProgress[lessonId].classwork_comment;
  } else {
    payload.homework_comment = lessonProgress[lessonId].homework_comment;
  }
  
  try {
    await apiClient.post('/student-lesson-progress', payload);
    progressSuccess[lessonId][commentType] = true;
    setTimeout(() => { progressSuccess[lessonId][commentType] = false; }, 3000);
  } catch (err) {
    console.error(`Failed to save progress for lesson ${lessonId}:`, err);
    progressErrors[lessonId] = err.response?.data?.msg || 'Failed to save feedback.';
  } finally {
    isSavingProgress[lessonId][commentType] = false;
  }
};

const handleFileUpload = (event, lessonId) => {
  const file = event.target.files[0];
  if (file && uploadStates[lessonId]) {
    uploadStates[lessonId].file = file;
    uploadStates[lessonId].error = '';
  }
};

const uploadWork = async (lessonId) => {
  const lessonState = uploadStates[lessonId];
  if (!lessonState || !lessonState.file) return;

  isUploadingWork.value = true;
  lessonState.error = '';

  const formData = new FormData();
  formData.append('file', lessonState.file);
  formData.append('work_type', lessonState.workType);
  if (lessonState.description.trim()) {
    formData.append('description', lessonState.description.trim());
  }
  
  try {
    await apiClient.post(`/lessons/${lessonId}/students/${props.studentId}/upload_work`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    const fileInput = document.getElementById(`file-upload-${lessonId}`);
    if (fileInput) fileInput.value = null;
    
    uploadStates[lessonId] = {
      file: null,
      description: '',
      workType: 'classwork',
      error: '',
    };
    
    await fetchStudentProgress(); 
  } catch (err) {
    console.error(`Failed to upload work for lesson ${lessonId}:`, err);
    const errorMessage = err.response?.data?.msg || 'Failed to upload file.';
    if (uploadStates[lessonId]) {
      uploadStates[lessonId].error = errorMessage;
    }
  } finally {
    isUploadingWork.value = false;
  }
};

const confirmDeleteWork = (work) => {
  workToDelete.value = work;
  showDeleteWorkConfirmModal.value = true;
};

const performDeleteWork = async () => {
    if (!workToDelete.value) return;
    try {
        await apiClient.delete(`/student-works/${workToDelete.value.id}`);
        await fetchStudentProgress();
    } catch (err) {
        console.error('Failed to delete work:', err);
        error.value = 'Failed to delete work.';
    } finally {
        showDeleteWorkConfirmModal.value = false;
        workToDelete.value = null;
    }
};

const getWorkDownloadUrl = (storedFilename) => {
    return `${apiClient.defaults.baseURL}/student-works/download/${storedFilename}?token=${localStorage.getItem('accessToken')}`;
};

const toggleLessonPanel = (lessonId) => {
  activeLessonId.value = activeLessonId.value === lessonId ? null : lessonId;
  
  if (activeLessonId.value === lessonId) {
    if (!uploadStates[lessonId]) {
      uploadStates[lessonId] = {
        file: null,
        description: '',
        workType: 'classwork',
        error: '',
      };
    }
  }
};
</script>