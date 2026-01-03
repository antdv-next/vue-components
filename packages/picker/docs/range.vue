<script setup lang="ts">
import type { Moment } from 'moment'
import type { RangePickerRef } from '../src/interface'
import moment from 'moment'
import { computed, h, ref } from 'vue'
import { RangePicker } from '../src'
import momentGenerateConfig from '../src/generate/moment'
import zhCN from '../src/locale/zh_CN'

const defaultStartValue = moment('2019-09-03 05:02:03')
const defaultEndValue = moment('2019-11-28 01:02:03')

function formatDate(date: Moment | null) {
  return date ? date.format('YYYY-MM-DD HH:mm:ss') : 'null'
}

const value = ref<[Moment | null, Moment | null] | null>([
  defaultStartValue,
  defaultEndValue,
])

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

const rangePickerRef = ref<RangePickerRef>()

const now = momentGenerateConfig.getNow()
function disabledDate(current: Moment) {
  return current.diff(now, 'days') > 1 || current.diff(now, 'days') < -1
}

const renderExtraFooter = () => h('div', 'extra footer')
</script>

<template>
  <div>
    <h2>Value: {{ value ? `${formatDate(value[0])} ~ ${formatDate(value[1])}` : 'null' }}</h2>

    <div style="display: flex; flex-wrap: wrap;">
      <div style="margin: 0 8px;">
        <h3>Basic</h3>
        <RangePicker
          v-bind="sharedProps"
          ref="rangePickerRef"
          :value="undefined"
          :locale="zhCN"
          allow-clear
          :default-value="[moment('1990-09-03'), moment('1989-11-28')]"
          :clear-icon="h('span', {}, 'X')"
          :suffix-icon="h('span', {}, 'O')"
          :presets="[
            {
              label: 'Last week',
              value: [moment().subtract(1, 'week'), moment()],
            },
            {
              label: 'Last 3 days',
              value: () => [moment().subtract(3, 'days'), moment().add(3, 'days')],
            },
          ]"
        />
        <RangePicker
          v-bind="sharedProps"
          ref="rangePickerRef"
          :locale="zhCN"
          allow-clear
          show-time
          style="width: 580px"
          :cell-render="(current, info) => (
            h('div', { title: info.type, style: { background: 'green' } }, [
              typeof current === 'number' ? current : current.get('date'),
            ])
          )"
          :ranges="{
            ranges: [moment(), moment().add(10, 'day')],
          }"
          change-on-blur
          @ok="(dates: unknown) => {
            console.log('OK!!!', dates)
          }"
        />
        <RangePicker
          v-bind="sharedProps"
          :value="undefined"
          :locale="zhCN"
          allow-clear
          picker="time"
          :ranges="{
            test: [moment(), moment().add(1, 'hour')],
          }"
        />
        <RangePicker
          v-bind="sharedProps"
          :value="undefined"
          :locale="zhCN"
          allow-clear
          picker="time"
          style="width: 280px"
        />
      </div>

      <div style="margin: 0 8px;">
        <h3>Focus</h3>
        <RangePicker
          v-bind="sharedProps"
          ref="rangePickerRef"
          :locale="zhCN"
          allow-clear
        />
        <button
          type="button"
          @click="rangePickerRef?.focus()"
        >
          Focus!
        </button>
      </div>

      <div style="margin: 0 8px;">
        <h3>Year</h3>
        <RangePicker v-bind="sharedProps" :locale="zhCN" picker="year" />
      </div>

      <div style="margin: 0 8px;">
        <h3>Quarter</h3>
        <RangePicker v-bind="sharedProps" :locale="zhCN" picker="quarter" />
      </div>

      <div style="margin: 0 8px;">
        <h3>Month</h3>
        <RangePicker v-bind="sharedProps" :locale="zhCN" picker="month" />
      </div>

      <div style="margin: 0 8px;">
        <h3>Week</h3>
        <RangePicker v-bind="sharedProps" :locale="zhCN" picker="week" />
      </div>

      <div style="margin: 0 8px;">
        <h3>Allow Empty</h3>
        <RangePicker
          v-bind="sharedProps"
          :locale="zhCN"
          allow-clear
          :allow-empty="[true, true]"
        />
      </div>

      <div style="margin: 0 8px;">
        <h3>Start disabled</h3>
        <RangePicker v-bind="sharedProps" :locale="zhCN" allow-clear :disabled="[true, false]" />
      </div>
      <div style="margin: 0 8px;">
        <h3>End disabled</h3>
        <RangePicker v-bind="sharedProps" :locale="zhCN" allow-clear :disabled="[false, true]" />
      </div>

      <div style="margin: 0 8px;">
        <h3>Uncontrolled</h3>
        <RangePicker
          v-bind="sharedProps"
          :value="undefined"
          :locale="zhCN"
          :placeholder="['start...', 'end...']"
          :disabled="[false, true]"
          :allow-empty="[false, true]"
          :render-extra-footer="renderExtraFooter"
        />
      </div>
      <div style="margin: 0 8px;">
        <h3>Uncontrolled2</h3>
        <RangePicker
          v-bind="sharedProps"
          :value="undefined"
          :locale="zhCN"
          :placeholder="['start...', 'end...']"
        />
      </div>
      <div style="margin: 0 8px;">
        <h3>DisabledDate</h3>
        <RangePicker
          v-bind="sharedProps"
          :value="undefined"
          :locale="zhCN"
          :placeholder="['start...', 'end...']"
          :disabled-date="disabledDate"
        />
      </div>
      <div style="margin: 0 8px;">
        <h3>PreviewValue is false</h3>
        <RangePicker
          v-bind="sharedProps"
          :preview-value="false"
          :value="undefined"
          :locale="zhCN"
          :placeholder="['start...', 'end...']"
          :disabled-date="disabledDate"
        />
      </div>
    </div>
  </div>
</template>

<style src="../assets/index.less"></style>

<style src="./common.less"></style>
