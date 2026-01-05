<script setup lang="ts">
import type { PickerMode } from '../src/interface'
import { ref } from 'vue'
import Picker from '../src'
import momentGenerateConfig from '../src/generate/moment'
import zhCN from '../src/locale/zh_CN'

const type = ref<PickerMode>('date')

function onChange(value: any) {
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
      :generate-config="momentGenerateConfig"
      :locale="zhCN"
      :picker="type === 'date' ? undefined : type"
      @change="onChange"
    />
  </div>
</template>

<style src="../assets/index.less"></style>
