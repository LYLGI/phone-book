<script setup lang="ts">
import type { Contact, ContactMethod } from '../stores/contact'

defineProps<{
  contacts: Contact[]
}>()

const emit = defineEmits<{
  'edit': [contact: Contact]
  'delete': [contact: Contact]
  'toggleFavorite': [contact: Contact]
}>()

// 基础列配置
const baseColumns = [
  { prop: 'name', label: '姓名', width: '120' },
  { prop: 'address', label: '家庭住址', width: '200' }
]

// 自定义列模板，用于显示联系方式
const renderContactMethod = (contact: Contact) => {
  // 按类型分组联系方式
  const methodsByType = contact.contactMethods.reduce((acc, method) => {
    if (!acc[method.type]) {
      acc[method.type] = []
    }
    acc[method.type].push(method)
    return acc
  }, {} as Record<string, ContactMethod[]>)

  return Object.entries(methodsByType).map(([_, methods]) => {
    return methods.map(method => `${method.label}: ${method.value}`).join('\n')
  }).join('\n')
}
</script>

<template>
  <el-table :data="contacts" border style="width: 100%" :fit="true">
    <!-- 基础列 -->
    <el-table-column
      v-for="col in baseColumns"
      :key="col.prop"
      :prop="col.prop"
      :label="col.label"
      :min-width="col.width"
    />

    <!-- 联系方式列 -->
    <el-table-column label="联系方式" min-width="300">
      <template #default="{ row }">
        <div style="white-space: pre-line">
          {{ renderContactMethod(row) }}
        </div>
      </template>
    </el-table-column>

    <!-- 收藏和操作列保持不变 -->
    <el-table-column label="收藏" min-width="80" align="center" fixed="right">
      <template #default="{ row }">
        <el-button
          :type="row.isFavorite ? 'danger' : 'default'"
          :icon="row.isFavorite ? 'Star' : 'StarFilled'"
          circle
          @click="emit('toggleFavorite', row)"
        />
      </template>
    </el-table-column>
    <el-table-column label="操作" min-width="150" align="center" fixed="right">
      <template #default="{ row }">
        <el-button type="primary" size="small" @click="emit('edit', row)">编辑</el-button>
        <el-button type="danger" size="small" @click="emit('delete', row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped>
:deep(.el-table) {
  flex: 1;
}

:deep(.el-table__cell) {
  padding: 8px 0;
}
</style> 