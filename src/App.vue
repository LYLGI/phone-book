<script setup lang="ts">
// 导入所需的组件和工具
import { ref } from 'vue' // ref用于创建响应式数据
import { ElMessage, ElMessageBox } from 'element-plus' // Element Plus的消息提示组件
import { useContactStore } from './stores/contact' // 导入联系人状态管理store
import type { Contact } from './stores/contact' // 导入Contact类型定义
// 导入自定义组件
import TitleBar from './components/TitleBar.vue'
import OperationBar from './components/OperationBar.vue'
import ContactTable from './components/ContactTable.vue'
import ContactDialog from './components/ContactDialog.vue'

// 初始化store，用于状态管理
const store = useContactStore()

// 弹窗相关的响应式数据
const dialogVisible = ref(false) // 控制弹窗的显示和隐藏
const dialogTitle = ref('新增联系人') // 弹窗标题
const currentContact = ref<Contact>() // 当前正在编辑的联系人数据

// 新增联系人的处理函数
const handleAdd = () => {
  dialogTitle.value = '新增联系人' // 设置弹窗标题
  currentContact.value = undefined // 清空当前联系人数据
  dialogVisible.value = true // 显示弹窗
}

// 编辑联系人的处理函数
const handleEdit = (contact: Contact) => {
  dialogTitle.value = '编辑联系人'
  currentContact.value = { ...contact } // 使用展开运算符创建联系人数据的副本
  dialogVisible.value = true
}

// 删除联系人的处理函数
const handleDelete = (contact: Contact) => {
  // 显示确认删除的对话框
  ElMessageBox.confirm('确定要删除该联系人吗？', '提示', {
    type: 'warning'
  }).then(() => {
    store.deleteContact(contact.id) // 从store中删除联系人
    ElMessage.success('删除成功') // 显示成功提示
  })
}

// 切换收藏状态的处理函数
const toggleFavorite = (contact: Contact) => {
  const isFavorite = store.toggleFavorite(contact.id)
  // 根据收藏状态显示不同的提示信息
  ElMessage.success(isFavorite ? '已添加到收藏' : '已取消收藏')
}

// 保存联系人的处理函数
const handleSave = (contact: Contact) => {
  if (contact.id === 0) {
    // id为0表示新增联系人
    contact.id = Date.now() // 使用时间戳作为唯一ID
    store.addContact(contact)
  } else {
    // 更新已有联系人
    store.updateContact(contact)
  }
  ElMessage.success('保存成功')
}

// 处理导入联系人的函数
const handleImport = (importedContacts: Contact[]) => {
  store.importContacts(importedContacts)
}
</script>

<template>
  <div class="container">
    <!-- 标题栏组件 -->
    <TitleBar title="电话簿管理系统" />

    <!-- 操作栏组件：包含新增、导入导出、搜索和收藏过滤功能 -->
    <OperationBar :contacts="store.contacts as any" v-model:show-favorites="store.showFavorites as any"
      v-model:search-keyword="store.searchKeyword as any" @add="handleAdd" @import="handleImport" />

    <!-- 联系人表格组件：显示联系人列表和操作按钮 -->
    <ContactTable :contacts="store.filteredContacts as any" @edit="handleEdit" @delete="handleDelete"
      @toggle-favorite="toggleFavorite" />

    <!-- 联系人编辑弹窗组件 -->
    <ContactDialog v-model:visible="dialogVisible" :title="dialogTitle" :contact="currentContact" @save="handleSave" />
  </div>
</template>

<style scoped>
/* 容器样式 */
.container {
  padding: 20px;
  /* 内边距 */
  height: 100vh;
  /* 视口高度 */
  display: flex;
  /* 使用flex布局 */
  flex-direction: column;
  /* 垂直排列 */
}
</style>
