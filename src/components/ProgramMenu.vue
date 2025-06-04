<template>
  <div class="program-menu p-4 bg-gray-50 rounded-lg shadow">
    <p v-if="!lessons || lessons.length === 0" class="text-gray-500 italic">
      No lessons in this program yet, or program not assigned.
    </p>
    <div v-else>
      <h4 class="text-lg font-semibold text-gray-700 mb-3">Program Lessons:</h4>
      <ul class="space-y-3">
        <li v-for="lesson in sortedLessons" :key="lesson.id" class="p-3 bg-white rounded-md shadow-sm border border-gray-200">
          <p class="font-medium text-gray-800">{{ lesson.topic }}</p>
          <p v-if="lesson.description" class="text-sm text-gray-600 mt-1">{{ lesson.description }}</p>
           <p class="text-xs text-gray-400 mt-1">Order: {{ lesson.order === null ? 'N/A' : lesson.order }}</p>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  lessons: { // Ожидаем массив уроков
    type: Array,
    default: () => [],
  },
});

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
</script>