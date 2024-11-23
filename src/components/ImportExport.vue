<script setup lang="ts">
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { ElMessage } from 'element-plus'
import type { Contact, ContactMethod } from '../stores/contact'

const props = defineProps<{
    contacts: Contact[]
}>()

const emit = defineEmits<{
    'import': [contacts: Contact[]]
}>()

const fileInput = ref<HTMLInputElement | null>(null)

// 导出Excel
const exportToExcel = () => {
    try {
        // 准备导出数据
        const exportData = props.contacts.map(contact => {
            const methodsByType = contact.contactMethods.reduce((acc, method) => {
                if (!acc[method.type]) {
                    acc[method.type] = []
                }
                acc[method.type].push(method)
                return acc
            }, {} as Record<string, ContactMethod[]>)

            const result: Record<string, string> = {
                姓名: contact.name,
                家庭住址: contact.address
            }

            // 添加所有联系方式
            Object.entries(methodsByType).forEach(([type, methods]) => {
                methods.forEach((method, index) => {
                    result[method.label] = method.value
                })
            })

            return result
        })

        const worksheet = XLSX.utils.json_to_sheet(exportData)

        // 添加大表头
        XLSX.utils.sheet_add_aoa(worksheet, [['姓名']], { origin: 'A1' })

        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, '联系人')

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })

        saveAs(data, `联系人_${new Date().toLocaleDateString()}.xlsx`)
        ElMessage.success('导出成功')
    } catch (error) {
        ElMessage.error('导出失败')
        console.error('Export error:', error)
    }
}

// 导入Excel
const importFromExcel = (event: Event) => {
    const target = event.target as HTMLInputElement
    if (!target.files?.length) return

    const file = target.files[0]
    const reader = new FileReader()

    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer)
            const workbook = XLSX.read(data, { type: 'array' })
            const worksheet = workbook.Sheets[workbook.SheetNames[0]]
            const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, string>[]

            // 转换数据格式
            const contacts: Contact[] = jsonData.map(row => {
                const contact: Contact = {
                    id: Date.now() + Math.random(),
                    name: row['姓名'] || '',
                    address: row['家庭住址'] || '',
                    isFavorite: false,
                    contactMethods: []
                }

                // 处理所有可能的联系方式
                Object.entries(row).forEach(([key, value]) => {
                    if (key !== '姓名' && key !== '家庭住址' && value) {
                        const type = key.includes('手机') ? 'phone' :
                            key.includes('邮箱') ? 'email' :
                                key.includes('QQ') ? 'qq' : 'other'

                        contact.contactMethods.push({
                            id: Date.now() + Math.random(),
                            type,
                            value,
                            label: key
                        })
                    }
                })

                return contact
            })

            emit('import', contacts)
            ElMessage.success('导入成功')
        } catch (error) {
            ElMessage.error('导入失败，请检查文件格式')
            console.error('Import error:', error)
        }
    }

    reader.readAsArrayBuffer(file)
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}
</script>

<template>
    <div class="import-export">
        <el-button type="primary" @click="exportToExcel">导出Excel</el-button>
        <input ref="fileInput" type="file" accept=".xlsx,.xls" style="display: none" @change="importFromExcel">
        <el-button type="success" @click="fileInput?.click()">导入Excel</el-button>
    </div>
</template>

<style scoped>
.import-export {
    display: flex;
    gap: 10px;
}
</style>