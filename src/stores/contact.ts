import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 联系方式类型
export interface ContactMethod {
  id: number
  type: string      // 联系方式类型（如：手机号、邮箱等）
  value: string     // 具体的联系方式值
  label: string     // 显示的标签（如：手机号一、手机号二）
}

// 联系人接口
export interface Contact {
  id: number
  name: string
  address: string
  isFavorite: boolean
  contactMethods: ContactMethod[]  // 改为动态的联系方式数组
}

export const useContactStore = defineStore('contact', () => {
  // 状态
  const contacts = ref<Contact[]>([])
  const showFavorites = ref(false)
  const searchKeyword = ref('')

  // 过滤后的联系人列表
  const filteredContacts = computed(() => {
    let result = contacts.value

    // 搜索过滤
    if (searchKeyword.value) {
      const keyword = searchKeyword.value.toLowerCase()
      result = result.filter(contact => 
        contact.name.toLowerCase().includes(keyword) ||
        contact.address.toLowerCase().includes(keyword) ||
        // 搜索所有联系方式
        contact.contactMethods.some(method => 
          method.value.toLowerCase().includes(keyword)
        )
      )
    }

    // 收藏过滤
    if (showFavorites.value) {
      result = result.filter(contact => contact.isFavorite)
    }

    return result
  })

  // 从localStorage加载数据
  const loadFromStorage = () => {
    const stored = localStorage.getItem('contacts')
    if (stored) {
      contacts.value = JSON.parse(stored)
    }
  }

  // 保存数据到localStorage
  const saveToStorage = () => {
    localStorage.setItem('contacts', JSON.stringify(contacts.value))
  }

  // 添加联系人
  const addContact = (contact: Contact) => {
    contacts.value.push(contact)
    saveToStorage()
  }

  // 更新联系人
  const updateContact = (contact: Contact) => {
    const index = contacts.value.findIndex(item => item.id === contact.id)
    if (index !== -1) {
      contacts.value[index] = contact
      saveToStorage()
    }
  }

  // 删除联系人
  const deleteContact = (id: number) => {
    contacts.value = contacts.value.filter(item => item.id !== id)
    saveToStorage()
  }

  // 切换收藏状态
  const toggleFavorite = (id: number) => {
    const contact = contacts.value.find(item => item.id === id)
    if (contact) {
      contact.isFavorite = !contact.isFavorite
      saveToStorage()
    }
    return contact?.isFavorite
  }

  // 批量导入联系人
  const importContacts = (newContacts: Contact[]) => {
    contacts.value = [...contacts.value, ...newContacts]
    saveToStorage()
  }

  // 初始化时加载数据
  loadFromStorage()

  return {
    contacts,
    showFavorites,
    searchKeyword,
    filteredContacts,
    addContact,
    updateContact,
    deleteContact,
    toggleFavorite,
    importContacts
  }
}) 