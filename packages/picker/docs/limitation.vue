<script setup lang="ts">
import dayjs from 'dayjs/esm'
import LocalizedFormat from 'dayjs/esm/plugin/localizedFormat'
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
</script>

<template>
  <div>
    <SinglePicker
      v-bind="sharedLocale"
      :default-value="dayjs('2020-09-03')"
      :min-date="dayjs('2019-08-01')"
      :max-date="dayjs('2020-10-31')"
    />
    <SinglePicker
      v-bind="sharedLocale"
      :default-value="dayjs('2020-09-03')"
      :min-date="dayjs('2019-08-01')"
      :max-date="dayjs('2020-10-31')"
      picker="month"
    />
    <SinglePicker
      v-bind="sharedLocale"
      :default-value="dayjs('2020-09-03')"
      :min-date="dayjs('2019-08-01')"
      :max-date="dayjs('2020-10-31')"
      picker="quarter"
    />
  </div>
</template>

<style src="../assets/index.less"></style>
