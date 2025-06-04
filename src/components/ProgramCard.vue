<template>
  <div class="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
    <div class="p-6">
      <h3 class="text-2xl font-semibold text-gray-800 mb-2">{{ program.name }}</h3>
      <p class="text-gray-600 text-sm mb-4">
        Lessons: {{ program.lesson_count }}
      </p>
      <div class="flex justify-end space-x-2">
        <button
          @click="$emit('view-details', program.id)"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Details
        </button>
        <button
          @click="$emit('edit-program', program)"
          class="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
        >
          Edit
        </button>
        <button
          @click="$emit('delete-program', program.id)"
          class="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  program: {
    type: Object,
    required: true,
  },
});
defineEmits(['view-details', 'edit-program', 'delete-program']);
</script>