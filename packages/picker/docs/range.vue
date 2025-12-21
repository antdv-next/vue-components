<script setup lang="ts">
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { h, ref } from 'vue'
import dayjsGenerateConfig from '../src/generate/dayjs'
import { RangePicker } from '../src/index'
import zhCN from '../src/locale/zh_CN'

const defaultStartValue = dayjs('2019-09-03 05:02:03')
const defaultEndValue = dayjs('2019-11-28 01:02:03')

const value = ref<[Dayjs | null, Dayjs | null] | null>([
  defaultStartValue,
  defaultEndValue,
])

function onChange(newValue: [Dayjs | null, Dayjs | null] | null, formatStrings: string[]) {
  console.log('Change:', newValue, formatStrings)
  value.value = newValue
}

function onCalendarChange(newValue: [Dayjs | null, Dayjs | null] | null, formatStrings: string[], info: any) {
  console.log('Calendar Change:', newValue, formatStrings, info)
}

const sharedProps = {
  generateConfig: dayjsGenerateConfig,
  onChange,
  onCalendarChange,
}

const rangePickerRef = ref()

function cellRender(current: Dayjs | number, info: any) {
  return h(
    'div',
    { title: info.type, style: { background: 'green' } },
    typeof current === 'number' ? current : current.date(),
  )
}
</script>

<template>
  <div>
    <h2>
      Value:
      {{
        value
          ? `${value[0]?.format('YYYY-MM-DD HH:mm:ss')} ~ ${value[1]?.format('YYYY-MM-DD HH:mm:ss')}`
          : 'null'
      }}
    </h2>

    <div style="display: flex; flex-wrap: wrap">
      <div style="margin: 0 8px">
        <h3>Basic</h3>
        <RangePicker
          v-bind="sharedProps"
          ref="rangePickerRef"
          :locale="zhCN"
          allow-clear
          :default-value="[dayjs('1990-09-03'), dayjs('1989-11-28')]"
          :presets="[
            {
              label: 'Last week',
              value: [dayjs().subtract(1, 'week'), dayjs()],
            },
            {
              label: 'Last 3 days',
              value: () => [dayjs().subtract(3, 'days'), dayjs().add(3, 'days')],
            },
          ]"
        >
          <template #clearIcon>
            <span>X</span>
          </template>
          <template #suffixIcon>
            <span>O</span>
          </template>
        </RangePicker>

        <RangePicker
          v-bind="sharedProps"
          :locale="zhCN"
          allow-clear
          show-time
          :style="{ width: '580px' }"
          :cell-render="cellRender"
          :ranges="{
            ranges: [dayjs(), dayjs().add(10, 'day')],
          }"
          change-on-blur
        />
      </div>

      <div style="margin: 0 8px">
        <h3>Focus</h3>
        <RangePicker
          v-bind="sharedProps"
          ref="rangePickerRef"
          :locale="zhCN"
          allow-clear
        />
        <button type="button" @click="rangePickerRef?.focus()">
          Focus!
        </button>
      </div>

      <div style="margin: 0 8px">
        <h3>Year</h3>
        <RangePicker v-bind="sharedProps" :locale="zhCN" picker="year" />
      </div>

      <div style="margin: 0 8px">
        <h3>Quarter</h3>
        <RangePicker v-bind="sharedProps" :locale="zhCN" picker="quarter" />
      </div>

      <div style="margin: 0 8px">
        <h3>Month</h3>
        <RangePicker v-bind="sharedProps" :locale="zhCN" picker="month" />
      </div>

      <div style="margin: 0 8px">
        <h3>Week</h3>
        <RangePicker v-bind="sharedProps" :locale="zhCN" picker="week" />
      </div>
    </div>
  </div>
</template>

<style src="../assets/index.less"></style>

<style src="./common.less"></style>
