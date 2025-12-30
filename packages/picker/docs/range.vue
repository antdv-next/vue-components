<script setup lang="ts">
import type { Moment } from 'moment'
import moment from 'moment'
import { computed, h, ref } from 'vue'
import { RangePicker } from '../src'
import momentGenerateConfig from '../src/generate/moment'
import zhCN from '../src/locale/zh_CN'

const defaultStartValue = moment('2019-09-03 05:02:03')
const defaultEndValue = moment('2019-11-28 01:02:03')
const value = ref<[Moment | null, Moment | null] | null>([defaultStartValue, defaultEndValue])

function formatDate(date: Moment | null) {
  return date ? date.format('YYYY-MM-DD HH:mm:ss') : 'null'
}

function onChange(newValue: [Moment | null, Moment | null] | null, formatStrings?: string[]) {
  console.log('Change:', newValue, formatStrings)
  value.value = newValue
}
function onCalendarChange(newValue: [Moment | null, Moment | null] | null, formatStrings?: string[]) {
  console.log('Calendar Change:', newValue, formatStrings)
}
const sharedProps = computed(() => {
  return {
    generateConfig: momentGenerateConfig,
    value: value.value,
    onChange,
    onCalendarChange,
  }
})

const rangePickerRef = ref()
</script>

<template>
  <div>
    <h2>Value: {{ value ? `${formatDate(value[0])} ~ ${formatDate(value[1])}` : 'null' }}</h2>

    <div style="display: flex; flex-wrap: wrap;">
      <div style="margin: 0 8px;">
        <h3>Basic</h3>
        <RangePicker

          v-bind="sharedProps"
          :ref="rangePickerRef"
          :value="undefined"
          :locale="zhCN"
          allow-clear
          :default-value="[moment('1990-09-03'), moment('1989-11-28')]"
          :clear-icon="h('span', {}, 'X')"
          :suffix-icon="h('span', {}, 'O')"
        />
      </div>
    </div>
  </div>
</template>
