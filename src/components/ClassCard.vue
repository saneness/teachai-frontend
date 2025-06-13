<template>
  <div 
    @click="$emit('view-details', classItem.id)"
    class="h-full min-h-[130px] flex flex-col bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 cursor-pointer group"
  >
    <div class="p-6 flex-grow">
      <div class="flex justify-between items-start">
        <!-- Main Info -->
        <div class="flex-grow">
          <h3 class="text-2xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">{{ classItem.name }}</h3>
          <p class="text-gray-600 text-sm mb-1">
            Program: {{ classItem.program_name || 'Not specified' }}
          </p>
          <p class="text-gray-600 text-sm">
            Students: {{ classItem.student_count }}
          </p>
        </div>
        <!-- Action Icons (appear on hover) -->
        <div @click.stop class="flex space-x-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div class="drag-handle cursor-grab text-gray-400 hover:text-gray-600 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 1a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V4a3 3 0 00-3-3H5z" clip-rule="evenodd" fill-rule="evenodd"/>
              <path d="M12 5a1 1 0 011 1v8a1 1 0 11-2 0V6a1 1 0 011-1zm-5 0a1 1 0 011 1v8a1 1 0 11-2 0V6a1 1 0 011-1z" />
            </svg>
          </div>
          <button
            @click="$emit('edit-class', classItem)"
            class="p-2 text-yellow-500 hover:text-yellow-700 hover:bg-yellow-100 rounded-full"
            title="Edit class"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd" /></svg>
          </button>
          <button
            @click="$emit('delete-class', classItem.id)"
            class="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full"
            title="Delete class"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
          </button>
        </div>
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