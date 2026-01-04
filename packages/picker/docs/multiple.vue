<script setup lang="ts">
import type { PickerRef } from '../src/interface'
import dayjs from 'dayjs/esm'
import LocalizedFormat from 'dayjs/esm/plugin/localizedFormat'
import { ref } from 'vue'
import dayjsGenerateConfig from '../src/generate/dayjs'
import zhCN from '../src/locale/zh_CN'
import SinglePicker from '../src/PickerInput/SinglePicker'
import 'dayjs/esm/locale/ar'
import 'dayjs/esm/locale/zh-cn'

dayjs.locale('zh-cn')
dayjs.extend(LocalizedFormat)

console.clear()
;(window as any).dayjs = dayjs

const sharedLocale = {
  locale: zhCN,
  generateConfig: dayjsGenerateConfig,
  style: { width: '300px' },
}

const singleRef = ref<PickerRef>()

function onOpenChange(open: boolean) {
  console.error(open)
}
</script>

<template>
  <div>
    <SinglePicker v-bind="sharedLocale" ref="singleRef" multiple @open-change="onOpenChange" />
    <SinglePicker v-bind="sharedLocale" ref="singleRef" multiple need-confirm />
    <SinglePicker
      v-bind="sharedLocale"
      multiple
      picker="week"
      :default-value="[
        dayjs('2021-01-01'),
        dayjs('2021-01-08'),
      ]"
    />
  </div>
</template>

<style src="../assets/index.less"></style>
