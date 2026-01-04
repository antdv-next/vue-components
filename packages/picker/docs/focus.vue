<script setup lang="ts">
import type { PickerRef } from '../src'
import type { RangePickerRef } from '../src/interface'
import { nextTick, ref, watch } from 'vue'
import { Picker, RangePicker } from '../src'
import momentGenerateConfig from '../src/generate/moment'
import zhCN from '../src/locale/zh_CN'

const open = ref(false)
const open2 = ref(false)

const pickerRef = ref<PickerRef>()
const rangePickerRef = ref<RangePickerRef>()

watch(open, async (val) => {
  if (val) {
    await nextTick()
    pickerRef.value?.focus({ preventScroll: true })
  }
})

watch(open2, async (val) => {
  if (val) {
    await nextTick()
    rangePickerRef.value?.focus({ preventScroll: true, index: 1 })
  }
})
</script>

<template>
  <div>
    <div style="height: 50vh" />
    <a href="#" @click.prevent="open = !open">picker {{ open }}</a>
    <br>
    <a href="#" @click.prevent="open2 = !open2">rangePicker {{ open2 }}</a>
    <div style="height: 80vh" />
    <Picker
      v-if="open"
      ref="pickerRef"
      open
      :locale="zhCN"
      :generate-config="momentGenerateConfig"
    />
    <RangePicker
      v-if="open2"
      ref="rangePickerRef"
      open
      :locale="zhCN"
      :generate-config="momentGenerateConfig"
    />
    <div style="height: 30vh" />
  </div>
</template>

<style src="../assets/index.less"></style>
