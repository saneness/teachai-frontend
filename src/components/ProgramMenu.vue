<template>
  <div class="program-menu p-4 bg-gray-50 rounded-lg shadow">
    <p v-if="!lessons || lessons.length === 0" class="text-gray-500 italic">
      No lessons in this program yet, or program not assigned.
    </p>
    <div v-else>
      <h4 class="text-lg font-semibold text-gray-700 mb-3">Program Lessons:</h4>
      <div class="space-y-2">
        <div v-for="lesson in sortedLessons" :key="lesson.id" class="border rounded-md bg-white overflow-hidden shadow-sm">
          <!-- Кликабельный заголовок урока -->
          <div 
            @click="toggleLessonPanel(lesson.id)"
            class="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <p class="font-medium text-gray-800">{{ lesson.topic }}</p>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 transition-transform duration-300" 
                 :class="{'rotate-180': activeLessonId === lesson.id}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <!-- Раскрываемое описание урока -->
          <div v-if="activeLessonId === lesson.id" class="p-3 border-t">
            <p v-if="lesson.description" class="text-sm text-gray-600 whitespace-pre-wrap">{{ lesson.description }}</p>
            <p v-else class="text-sm text-gray-500 italic">No description for this lesson.</p>
            <p class="text-xs text-gray-400 mt-2">Order: {{ lesson.order === null ? 'N/A' : lesson.order }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  lessons: {
    type: Array,
    default: () => [],
  },
});

// Состояние для отслеживания активного урока
const activeLessonId = ref(null);

const sortedLessons = computed(() => {
  if (props.lessons) {
    return [...props.lessons].sort((a, b) => {
      if (a.order === null) return 1;
      if (b.order === null) return -1;
      return a.order - b.order;
    });
  }
  return [];
});

// Функция для переключения видимости панели урока
const toggleLessonPanel = (lessonId) => {
  if (activeLessonId.value === lessonId) {
    activeLessonId.value = null; // Закрыть, если уже открыт
  } else {
    activeLessonId.value = lessonId; // Открыть новый
  }
};
</script>