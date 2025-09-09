<script setup lang="ts">
import { computed, h } from 'vue'
import Menu from '../src'

const menu1List = [
  {
    titleLocalKey: 'Properties',
    key: 'Properties',
  },
  {
    titleLocalKey: 'Resources',
    key: 'Resources',
    children: [
      {
        titleLocalKey: 'FAQ',
        key: 'Faq',
        isSub: true,
      },
      {
        titleLocalKey: 'Learn',
        key: 'Learn',
        isSub: true,
      },
    ],
  },
  {
    titleLocalKey: 'About Us',
    key: 'AboutUs',
  },
]

function menu1Items(values) {
  if (!values) {
    return undefined
  }
  return values.map((item) => {
    const result = {
      label: item.titleLocalKey,
      key: item.key,
    }
    
    // 只有当 children 存在时才添加 children 属性
    if (item.children && item.children.length > 0) {
      result.children = menu1Items(item.children)
    }
    
    return result
  })
}
const items = computed(() => menu1Items(menu1List))
</script>

<template>
  <Menu
    :selectable="false"
    mode="inline"
    :default-open-keys="['Resources']"
    style="width: 100%"
    :items="items"
  />
</template>

<style scoped>

</style>
