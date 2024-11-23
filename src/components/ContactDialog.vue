<script setup lang="ts">
import { reactive, watch, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { Contact, ContactMethod } from '../stores/contact'

const props = defineProps<{
  visible: boolean
  title: string
  contact?: Contact
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'save': [contact: Contact]
}>()

// 创建一个独立的表单数据对象
const form = reactive<Contact>({
  id: 0,
  name: '',
  address: '',
  isFavorite: false,
  contactMethods: []
})

// 深拷贝函数
const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj))
}

// 重置表单函数声明提前
const resetForm = () => {
  form.id = 0
  form.name = ''
  form.address = ''
  form.isFavorite = false
  form.contactMethods = [] // 重置为新数组
}

// 监听contact变化，使用深拷贝更新表单数据
watch(
  () => props.contact,
  (newVal) => {
    if (newVal) {
      // 使用深拷贝而不是直接赋值
      const clonedContact = deepClone(newVal)
      Object.assign(form, clonedContact)
      // 确保标签序号正确
      updateAllMethodLabels()
    } else {
      resetForm()
    }
  },
  { immediate: true } // 立即执行一次
)

// 联系方式类型选项 - 改为响应式数据
const methodTypes = ref([
  { value: 'phone', label: '手机号' },
  { value: 'email', label: '电子邮箱' },
  { value: 'qq', label: 'QQ' },
])

// 新增：自定义类型的对话框控制
const customTypeDialog = ref(false)
const newTypeForm = reactive({
  label: '',
  value: ''
})

// 新增：添加自定义类型
const handleAddCustomType = () => {
  if (!newTypeForm.label || !newTypeForm.value) {
    ElMessage.warning('类型名称和值不能为空')
    return
  }

  // 检查是否已存在相同的类型
  if (methodTypes.value.some(type => type.value === newTypeForm.value)) {
    ElMessage.warning('该类型已存在')
    return
  }

  // 添加新类型
  methodTypes.value.push({
    value: newTypeForm.value,
    label: newTypeForm.label
  })

  // 如果有正在编辑的联系方式，立即应用新类型
  if (currentEditingIndex.value !== -1) {
    const method = form.contactMethods[currentEditingIndex.value]
    const count = getMethodTypeCount(newTypeForm.value) + 1
    form.contactMethods[currentEditingIndex.value] = {
      ...method,
      type: newTypeForm.value,
      label: `${newTypeForm.label}${count}`
    }
    updateAllMethodLabels()
    currentEditingIndex.value = -1
  }

  // 保存到localStorage
  localStorage.setItem('contactMethodTypes', JSON.stringify(methodTypes.value))

  // 重置表单并关闭对话框
  newTypeForm.label = ''
  newTypeForm.value = ''
  customTypeDialog.value = false
}

// 新增：从localStorage加载自定义类型
const loadCustomTypes = () => {
  const stored = localStorage.getItem('contactMethodTypes')
  if (stored) {
    methodTypes.value = JSON.parse(stored)
  }
}

// 初始化时加载自定义类型
loadCustomTypes()

// 获取特定类型的联系方式数量
const getMethodTypeCount = (type: string) => {
  return form.contactMethods.filter(method => method.type === type).length
}

// 更新所有联系方式的标签
const updateAllMethodLabels = () => {
  // 按类型分组计数
  const counters: Record<string, number> = {}
  
  form.contactMethods.forEach(method => {
    const typeObj = methodTypes.value.find(t => t.value === method.type)
    if (typeObj) {
      // 初始化或增加计数器
      counters[method.type] = (counters[method.type] || 0) + 1
      // 更新标签
      method.label = `${typeObj.label}${counters[method.type]}`
    }
  })
}

// 添加新的联系方式
const addContactMethod = () => {
  const newId = Date.now() + Math.random()
  const type = methodTypes.value[0].value
  const typeObj = methodTypes.value[0]
  const count = getMethodTypeCount(type) + 1

  // 创建新对象而不是修改现有对象
  const newMethod: ContactMethod = {
    id: newId,
    type: type,
    value: '',
    label: `${typeObj.label}${count}`
  }
  form.contactMethods.push(newMethod)
}

// 删除联系方式
const removeContactMethod = (index: number) => {
  form.contactMethods.splice(index, 1)
  // 重新生成所有标签
  updateAllMethodLabels()
}

// 更新联系方式类型
const updateMethodType = (index: number, type: string) => {
  // 如果选择了添加自定义类型
  if (type === 'custom') {
    // 重置新类型表单
    newTypeForm.label = ''
    newTypeForm.value = ''
    // 显示自定义类型对话框
    customTypeDialog.value = true
    // 保存当前正在编辑的联系方式索引
    currentEditingIndex.value = index
    return
  }

  const method = form.contactMethods[index]
  const typeObj = methodTypes.value.find(t => t.value === type)
  if (typeObj) {
    // 计算新类型的序号
    const count = getMethodTypeCount(type) + 1
    // 创建新对象而不是修改现有对象
    form.contactMethods[index] = {
      ...method,
      type,
      label: `${typeObj.label}${count}`
    }
    // 重新生成所有标签
    updateAllMethodLabels()
  }
}

// 添加一个ref来保存当前正在编辑的联系方式索引
const currentEditingIndex = ref<number>(-1)

const handleSave = () => {
  if (!form.name) {
    ElMessage.warning('姓名为必填项')
    return
  }
  
  if (form.contactMethods.some(method => !method.value)) {
    ElMessage.warning('请填写所有联系方式')
    return
  }
  
  // 发送深拷贝的数据
  emit('save', deepClone(form))
  emit('update:visible', false)
}

const handleClose = () => {
  // 关闭弹窗
  emit('update:visible', false)
  // 重置表单数据
  resetForm()
  // 重置自定义类型相关的状态
  customTypeDialog.value = false
  newTypeForm.label = ''
  newTypeForm.value = ''
  currentEditingIndex.value = -1
}

// 添加对话框关闭事件的处理
const handleDialogClose = () => {
  handleClose()
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    width="500px"
    @update:model-value="(value: boolean) => emit('update:visible', value)"
    @close="handleDialogClose"
  >
    <el-form :model="form" label-width="100px">
      <el-form-item label="姓名" required>
        <el-input v-model="form.name" />
      </el-form-item>

      <!-- 动态联系方式表单 -->
      <el-form-item label="联系方式">
        <div v-for="(method, index) in form.contactMethods" :key="method.id" class="contact-method-item">
          <el-select v-model="method.type" @change="updateMethodType(index, method.type)">
            <el-option
              v-for="type in methodTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
            <!-- 添加自定义类型的选项 -->
            <el-option
              value="custom"
              label="+ 添加自定义类型"
              class="custom-type-option"
            />
          </el-select>
          <el-input v-model="method.value" :placeholder="`请输入${method.label}`" />
          <el-button type="danger" circle icon="Delete" @click="removeContactMethod(index)" />
        </div>
        <el-button type="primary" plain @click="addContactMethod">添加联系方式</el-button>
      </el-form-item>

      <el-form-item label="家庭住址">
        <el-input v-model="form.address" type="textarea" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSave">确定</el-button>
    </template>
  </el-dialog>

  <!-- 添加自定义类型的对话框 -->
  <el-dialog
    v-model="customTypeDialog"
    title="添加自定义类型"
    width="400px"
    append-to-body
  >
    <el-form :model="newTypeForm" label-width="100px">
      <el-form-item label="类型名称" required>
        <el-input v-model="newTypeForm.label" placeholder="如：微信" />
      </el-form-item>
      <el-form-item label="类型标识" required>
        <el-input v-model="newTypeForm.value" placeholder="如：wechat" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="customTypeDialog = false">取消</el-button>
      <el-button type="primary" @click="handleAddCustomType">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.contact-method-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.contact-method-item .el-select {
  width: 120px;
}

.contact-method-item .el-input {
  flex: 1;
}

/* 添加自定义类型选项的样式 */
:deep(.custom-type-option) {
  border-top: 1px solid #dcdfe6;
  color: #409EFF;
}
</style> 