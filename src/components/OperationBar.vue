<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'
import ImportExport from './ImportExport.vue'
import type { Contact } from '../stores/contact'

defineProps<{
  contacts: Contact[]
  showFavorites: boolean
  searchKeyword: string
}>()

const emit = defineEmits<{
  'update:showFavorites': [value: boolean]
  'update:searchKeyword': [value: string]
  'add': []
  'import': [contacts: Contact[]]
}>()
</script>

<template>
  <div class="header">
    <div class="left-buttons">
      <el-button type="primary" @click="emit('add')">新增联系人</el-button>
      <ImportExport 
        :contacts="contacts"
        @import="contacts => emit('import', contacts)"
      />
    </div>
    <div class="right-controls">
      <el-input
        :model-value="searchKeyword"
        @update:modelValue="(value: string) => emit('update:searchKeyword', value)"
        placeholder="搜索联系人（姓名、电话、邮箱、QQ、地址）"
        clearable
        :prefix-icon="Search"
        class="search-input"
      />
      <el-switch
        :model-value="showFavorites"
        @update:modelValue="(value: boolean) => emit('update:showFavorites', value)"
        active-text="仅显示收藏"
        inactive-text="显示全部"
      />
    </div>
  </div>
</template>

<style scoped>
.header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-buttons {
  display: flex;
  gap: 10px;
}

.right-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.search-input {
  width: 300px;
}
</style> 