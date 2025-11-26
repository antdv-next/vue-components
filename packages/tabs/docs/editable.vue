<script setup lang="ts">
import { ref } from 'vue'
import Tabs from '../src/index'

const countRef = ref(8)
const tabs = ref(Array.from({ length: countRef.value }).map((_, index) => ({
  key: `${index}`,
  content: `tab content ${index + 1}`,
})))

const editable = {
  onEdit: (editType: 'add' | 'remove', { key }: { key?: string }) => {
    if (editType === 'remove' && key !== undefined) {
      tabs.value = tabs.value.filter(item => item.key !== key)
    }
    else if (editType === 'add') {
      countRef.value += 1
      tabs.value = [
        ...tabs.value,
        { key: `${countRef.value}`, content: `tab content ${countRef.value}` },
      ]
    }
  },
}
</script>

<template>
  <div :style="{ maxWidth: '550px' }">
    <Tabs
      :editable="editable"
      default-active-key="8"
      :items="tabs.map(({ key, content }) => ({ key, label: `tab ${key}`, children: content }))"
    />
  </div>
</template>

<style src="../assets/index.less" lang="less"></style>
