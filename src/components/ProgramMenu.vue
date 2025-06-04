<template>
  <div class="program-menu p-4 bg-gray-100 rounded-lg shadow">
    <p v-if="!programItems || programItems.length === 0" class="text-gray-500">
      Program menu content will be displayed here. <!-- Translated -->
    </p>
    <ul v-else>
      <li v-for="item in programItems" :key="item.id">{{ item.name }}</li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  programItems: {
    type: Array,
    default: () => [],
  },
});
</script>