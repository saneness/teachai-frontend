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
      <div class="mb-6 pb-4 border-b border-gray-200">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-800 mb-1">{{ studentProgressData.name }}</h1>
        <p class="text-gray-600 text-md">Class: {{ studentProgressData.class_name }}</p>
        <p v-if="studentProgressData.program" class="text-gray-500 text-sm">Program: {{ studentProgressData.program.name }}</p>
        <p v-else class="text-gray-500 text-sm italic">No program assigned to this student's class.</p>
      </div>

      <h2 class="text-2xl font-semibold text-gray-700 mb-4">Program Lessons & Comments</h2>
      
      <div v-if="studentProgressData.program && studentProgressData.program.lessons && studentProgressData.program.lessons.length > 0">
        <div 
            v-for="lesson in sortedProgramLessons" 
            :key="lesson.id" 
            class="mb-6 p-4 border rounded-md shadow-sm bg-gray-50"
        >
          <div class="flex justify-between items-start mb-2">
            <div>
                <h3 class="text-xl font-semibold text-gray-800">{{ lesson.topic }}</h3>
                <p v-if="lesson.description" class="text-gray-600 mt-1 text-sm">{{ lesson.description }}</p>
                 <p class="text-xs text-gray-400 mt-1">Order: {{ lesson.order === null ? 'N/A' : lesson.order }}</p>
            </div>
          </div>
          
          <div>
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
              class="mt-2 px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              <span v-if="isSavingComment[lesson.id]">Saving...</span>
              <span v-else>Save Comment</span>
            </button>
            <p v-if="commentErrors[lesson.id]" class="text-xs text-red-500 mt-1">{{ commentErrors[lesson.id] }}</p>
            <p v-if="commentSuccess[lesson.id]" class="text-xs text-green-500 mt-1">Comment saved!</p>
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
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
// import { useRoute } from 'vue-router'; // УДАЛЕН НЕИСПОЛЬЗУЕМЫЙ ИМПОРТ
import apiClient from '../services/api';

const props = defineProps({
  studentId: {
    type: Number,
    required: true,
  },
  classId: { 
    type: Number,
    required: true,
  }
});

const studentProgressData = ref(null);
const isLoading = ref(true);
const error = ref(null);
// const route = useRoute(); // УДАЛЕНА НЕИСПОЛЬЗУЕМАЯ ПЕРЕМЕННАЯ

const lessonComments = reactive({}); 
const isSavingComment = reactive({}); 
const commentErrors = reactive({}); 
const commentSuccess = reactive({}); 

const classIdFromRoute = computed(() => props.classId); 


const sortedProgramLessons = computed(() => {
  if (studentProgressData.value && studentProgressData.value.program && studentProgressData.value.program.lessons) {
    return [...studentProgressData.value.program.lessons].sort((a, b) => {
      if (a.order === null) return 1;
      if (b.order === null) return -1;
      return a.order - b.order;
    });
  }
  return [];
});


const fetchStudentProgress = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await apiClient.get(`/students/${props.studentId}/progress`);
    studentProgressData.value = response.data;
    if (studentProgressData.value.program && studentProgressData.value.program.lessons) {
      studentProgressData.value.program.lessons.forEach(lesson => {
        lessonComments[lesson.id] = lesson.student_comment || '';
        isSavingComment[lesson.id] = false;
        commentErrors[lesson.id] = '';
        commentSuccess[lesson.id] = false;
      });
    }
  } catch (err) {
    console.error(`Failed to fetch student progress for id ${props.studentId}:`, err);
    if (err.response) {
        error.value = err.response.data?.msg || `Error ${err.response.status}`;
    } else if (err.request) {
      error.value = 'Network Error: Could not connect to the server.';
    } else {
        error.value = err.message || 'Failed to load student progress data';
    }
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchStudentProgress);

const saveComment = async (lessonId) => {
  isSavingComment[lessonId] = true;
  commentErrors[lessonId] = '';
  commentSuccess[lessonId] = false;
  try {
    await apiClient.post('/student-lesson-progress', {
      student_id: props.studentId,
      lesson_id: lessonId,
      comment: lessonComments[lessonId]
    });
    commentSuccess[lessonId] = true;
    setTimeout(() => commentSuccess[lessonId] = false, 3000); 
  } catch (err) {
    console.error(`Failed to save comment for lesson ${lessonId}:`, err);
    if (err.response && err.response.data && err.response.data.msg) {
      commentErrors[lessonId] = err.response.data.msg;
    } else if (err.request) {
      commentErrors[lessonId] = 'Network Error. Could not save comment.';
    }
    else {
      commentErrors[lessonId] = 'Failed to save comment.';
    }
  } finally {
    isSavingComment[lessonId] = false;
  }
};
</script>

