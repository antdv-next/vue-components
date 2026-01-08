<script setup lang="ts">
import type { Locale } from '../src/interface'
import dayjs from 'dayjs'
import buddhistEra from 'dayjs/plugin/buddhistEra'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import dayjsGenerateConfig from '../src/generate/dayjs'
import zhCN from '../src/locale/zh_CN'
import RangePicker from '../src/PickerInput/RangePicker'
// import 'dayjs/locale/ar'
// import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')
dayjs.extend(buddhistEra)
dayjs.extend(LocalizedFormat)

console.clear()
;(window as any).dayjs = dayjs

const myLocale: Locale = {
  ...zhCN,
}

const sharedLocale = {
  locale: myLocale,
  generateConfig: dayjsGenerateConfig,
}
</script>

<template>
  <div>
    <input value="2000-01-01" />
    <!--
    <RangePicker
      v-bind="sharedLocale"
      style="width: 400px"
      :on-change="(val: any) => console.error('>>>>>>>', val)"
    />
    -->
    <RangePicker v-bind="sharedLocale" style="width: 400px" show-time />

    <RangePicker
      v-bind="sharedLocale"
      style="width: 400px"
      :min-date="dayjs('2024')"
      open
      :mode="['year', 'year']"
    />
    <!--
    <SinglePicker
      v-bind="dateFnsSharedLocale"
      style="width: 400px"
      show-time
      :disabled-time="(...args: any[]) => {
        console.log('Time Single:', ...args)
        return {}
      }"
    />
    <SinglePicker
      v-bind="sharedLocale"
      style="width: 400px"
      :min-date="dayjs()"
      :on-change="(val: any) => console.error('>>>>>>>', val)"
    />
    <PickerPanel
      v-bind="sharedLocale"
      style="width: 400px"
    />
    -->
  </div>
</template>

<style src="../assets/index.less"></style>
