<script setup lang="ts">
import type { PickerMode } from '../src/interface'
import { ref } from 'vue'
import Picker from '../src'
import momentGenerateConfig from '../src/generate/moment'
import zhCN from '../src/locale/zh_CN'

const type = ref<PickerMode>('date')

const modelValue = ref()
function onChange(value: any) {
  modelValue.value = value
  console.log(value)
}
</script>

<template>
  <div>
    <select v-model="type">
      <option value="date">Date</option>
      <option value="week">Week</option>
      <option value="month">Month</option>
      <option value="quarter">Quarter</option>
      <option value="year">Year</option>
    </select>
    <Picker
      v-if="type === 'date'"
      :value="modelValue"
      :generate-config="momentGenerateConfig"
      :locale="zhCN"
      @change="onChange"
    />
    <Picker
      v-else
      :value="modelValue"
      :generate-config="momentGenerateConfig"
      :locale="zhCN"
      :picker="type"
      @change="onChange"
    />
  </div>
</template>

<style src="../assets/index.less"></style>
