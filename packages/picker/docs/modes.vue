<script setup lang="ts">
import type { Moment } from 'moment'
import moment from 'moment'
import { computed, ref } from 'vue'
import { RangePicker } from '../src'
import momentGenerateConfig from '../src/generate/moment'
import zhCN from '../src/locale/zh_CN'

const defaultStartValue = moment('2019-09-03 05:02:03')
const defaultEndValue = moment('2019-11-28 01:02:03')

function formatDate(date: Moment | null) {
  return date ? date.format('YYYY-MM-DD HH:mm:ss') : null
}

const value = ref<[Moment | null, Moment | null] | null>([
  defaultStartValue,
  defaultEndValue,
])

function onChange(newValue: [Moment | null, Moment | null] | null, formatStrings?: string[]) {
  console.log('Change:', newValue, formatStrings)
  value.value = newValue
}

function onPanelChange(values: [Moment | null, Moment | null] | null) {
  value.value = values
}

const sharedProps = computed(() => {
  return {
    generateConfig: momentGenerateConfig,
    value: value.value,
    onChange,
    onPanelChange,
  }
})
</script>

<template>
  <div>
    <h2>Value: {{ value ? `${formatDate(value[0])} ~ ${formatDate(value[1])}` : 'null' }}</h2>

    <div style="display: flex; flex-wrap: wrap;">
      <div style="margin: 0 8px;">
        <h3>Basic</h3>
        <RangePicker
          v-bind="sharedProps"
          :locale="zhCN"
          :mode="['month', 'month']"
          :default-value="[moment('1990-09-03'), moment('1989-11-28')]"
        />
      </div>
    </div>
  </div>
</template>

<style src="../assets/index.less"></style>

<style src="./common.less"></style>
