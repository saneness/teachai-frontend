<template>
  <div class="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
    <div class="p-6">
      <h3 class="text-2xl font-semibold text-gray-800 mb-2">{{ classItem.name }}</h3>
      <p class="text-gray-600 text-sm mb-1">
        Program: {{ classItem.program_name || 'Not specified' }} <!-- Translated -->
      </p>
      <p class="text-gray-600 text-sm mb-4">
        Students: {{ classItem.student_count }} <!-- Translated -->
      </p>
      <div class="flex justify-end space-x-2">
        <button
          @click="$emit('view-details', classItem.id)"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Details <!-- Translated -->
        </button>
        <button
          @click="$emit('edit-class', classItem)"
          class="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
        >
          Edit <!-- Translated -->
        </button>
        <button
          @click="$emit('delete-class', classItem.id)"
          class="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Delete <!-- Translated -->
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  classItem: {
    type: Object,
    required: true,
  },
});

defineEmits(['view-details', 'edit-class', 'delete-class']);
</script>