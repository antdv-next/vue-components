<script setup lang="ts">
import type { PickerRef } from '../src'
import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import { ref } from 'vue'
import dayjsGenerateConfig from '../src/generate/dayjs'
import zhCN from '../src/locale/zh_CN'
import SinglePicker from '../src/PickerInput/SinglePicker'
import 'dayjs/esm/locale/ar'
import 'dayjs/esm/locale/zh-cn'

dayjs.locale('zh-cn')
dayjs.extend(LocalizedFormat)

const sharedLocale = {
  locale: zhCN,
  generateConfig: dayjsGenerateConfig,
  style: { width: '300px' },
}

const singleRef = ref<PickerRef>()

function onOpenChange(open: boolean) {
  console.log(open)
}
function handleChange(value: any, dateString: string[]) {
  console.log('Selected Time: ', value)
  console.log('Formatted Selected Time: ', dateString)
}
</script>

<template>
  <div>
    <SinglePicker
      v-bind="sharedLocale"
      ref="singleRef" max-tag-count="responsive" multiple @change="handleChange" @open-change="onOpenChange"
    />
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
