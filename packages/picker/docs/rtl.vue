<script setup lang="ts">
import type { Moment } from 'moment'
import type { PickerRef } from '../src'
import type { RangePickerRef } from '../src/interface'
import moment from 'moment'
import { computed, ref } from 'vue'
import { Picker, PickerPanel, RangePicker } from '../src'
import momentGenerateConfig from '../src/generate/moment'
import enUS from '../src/locale/en_US'
import jaJP from '../src/locale/ja_JP'
import zhCN from '../src/locale/zh_CN'

const defaultValue = moment()

function formatDate(date: Moment | null) {
  return date ? date.format('YYYY-MM-DD HH:mm:ss') : 'null'
}

const value = ref<Moment | null>(defaultValue)

const weekRef = ref<PickerRef>()
const rangePickerRef = ref<RangePickerRef>()

function onSelect(newValue: Moment) {
  console.log('Select:', newValue)
}

function onChange(newValue: any, formatString?: string | [string, string]) {
  const lastValue = Array.isArray(newValue) ? newValue[1] : newValue
  console.log('Change:', lastValue, newValue, formatString)
  value.value = lastValue
}

const sharedProps = computed(() => {
  return {
    generateConfig: momentGenerateConfig,
    value: value.value,
    onSelect,
    onChange,
    direction: 'rtl' as const,
  }
})
</script>

<template>
  <div dir="rtl">
    <h2>Value: {{ value ? formatDate(value) : 'null' }}</h2>

    <div style="display: flex; flex-wrap: wrap;">
      <div style="margin: 0 8px;">
        <h3>Basic</h3>
        <PickerPanel v-bind="sharedProps" :locale="zhCN" />
      </div>

      <div style="margin: 0 8px;">
        <h3>Uncontrolled</h3>
        <PickerPanel
          :generate-config="momentGenerateConfig"
          :locale="zhCN"
          :on-change="onChange"
          :default-value="moment('2000-01-01', 'YYYY-MM-DD')"
        />
      </div>

      <div style="margin: 0 8px;">
        <h3>1 Month earlier</h3>
        <PickerPanel
          v-bind="sharedProps"
          :default-picker-value="defaultValue.clone().subtract(1, 'month')"
          :locale="enUS"
        />
      </div>

      <div style="margin: 0 8px;">
        <h3>Week Picker CN</h3>
        <PickerPanel v-bind="sharedProps" :locale="zhCN" picker="week" />
      </div>

      <div style="margin: 0 8px;">
        <h3>Month Picker</h3>
        <PickerPanel v-bind="sharedProps" :locale="zhCN" picker="month" />
      </div>

      <div style="margin: 0 8px;">
        <h3>Week Picker US</h3>
        <PickerPanel v-bind="sharedProps" :locale="enUS" picker="week" />
      </div>

      <div style="margin: 0 8px;">
        <h3>Time</h3>
        <PickerPanel v-bind="sharedProps" :locale="jaJP" mode="time" />
      </div>
      <div style="margin: 0 8px;">
        <h3>Time AM/PM</h3>
        <PickerPanel
          v-bind="sharedProps"
          :locale="jaJP"
          mode="time"
          :show-time="{
            use12Hours: true,
            showSecond: false,
            format: 'hh:mm A',
          }"
        />
      </div>
      <div style="margin: 0 8px;">
        <h3>Datetime</h3>
        <PickerPanel v-bind="sharedProps" :locale="zhCN" show-time />
      </div>
    </div>

    <div style="display: flex;">
      <div style="margin: 0 8px;">
        <h3>Basic</h3>
        <Picker v-bind="sharedProps" :locale="zhCN" />
      </div>
      <div style="margin: 0 8px;">
        <h3>Uncontrolled</h3>
        <Picker :generate-config="momentGenerateConfig" :locale="zhCN" allow-clear />
      </div>
      <div style="margin: 0 8px;">
        <h3>Datetime</h3>
        <Picker
          v-bind="sharedProps"
          :locale="zhCN"
          :default-picker-value="defaultValue.clone().subtract(1, 'month')"
          :show-time="{
            showSecond: false,
            defaultValue: moment('11:28:39', 'HH:mm:ss'),
          }"
          show-today
          :disabled-time="(date: any) => {
            if (date && date.isSame(defaultValue, 'date')) {
              return {
                disabledHours: () => [1, 3, 5, 7, 9, 11],
              }
            }
            return {}
          }"
        />
      </div>
      <div style="margin: 0 8px;">
        <h3>Uncontrolled Datetime</h3>
        <Picker :generate-config="momentGenerateConfig" :locale="zhCN" />
      </div>
      <div style="margin: 0 8px;">
        <h3>Week</h3>
        <Picker
          v-bind="sharedProps"
          ref="weekRef"
          :locale="zhCN"
          format="gggg-Wo"
          allow-clear
          picker="week"
          :render-extra-footer="() => 'I am footer!!!'"
        />

        <button
          type="button"
          @click="weekRef?.focus()"
        >
          Focus
        </button>
      </div>
      <div style="margin: 0 8px;">
        <h3>Week</h3>
        <Picker :generate-config="momentGenerateConfig" :locale="zhCN" picker="week" />
      </div>
      <div style="margin: 0 8px;">
        <h3>Time</h3>
        <Picker v-bind="sharedProps" :locale="zhCN" picker="time" />
      </div>
      <div style="margin: 0 8px;">
        <h3>Time 12</h3>
        <Picker v-bind="sharedProps" :locale="zhCN" picker="time" use12-hours />
      </div>
      <div style="margin: 0 8px;">
        <h3>Year</h3>
        <Picker v-bind="sharedProps" :locale="zhCN" picker="year" />
      </div>
    </div>

    <div style="display: flex; flex-wrap: wrap;">
      <div style="margin: 0 8px;">
        <h3>Basic RangePicker</h3>
        <RangePicker
          v-bind="sharedProps"
          ref="rangePickerRef"
          :value="undefined"
          :locale="zhCN"
          allow-clear
          :default-value="[moment(), moment().add(1, 'M')]"
          :placeholder="['start...', 'end...']"
        />
      </div>
    </div>
  </div>
</template>

<style src="../assets/index.less"></style>
