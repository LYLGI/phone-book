<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <div class="title-bar">
    <h1>{{ title }}</h1>
  </div>
</template>

<style scoped>
.title-bar {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px 0;
  background-color: #409EFF;
  color: white;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.title-bar h1 {
  margin: 0;
  font-size: 24px;
}
</style> 