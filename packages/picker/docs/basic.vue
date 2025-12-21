<script setup lang="ts">
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { ref } from 'vue'
import dayjsGenerateConfig from '../src/generate/dayjs'
import Picker from '../src/index'
import enUS from '../src/locale/en_US'
import zhCN from '../src/locale/zh_CN'

const defaultValue = dayjs('2019-11-28 01:02:03')
const value = ref<Dayjs | null>(defaultValue)

function onChange(val: Dayjs | null, dateString: string) {
  console.log('Change:', val, dateString)
  value.value = val
}

function onSelect(val: Dayjs) {
  console.log('Select:', val)
}

const sharedProps = {
  generateConfig: dayjsGenerateConfig,
  onSelect,
  onChange,
  presets: [
    { label: 'Hello World!', value: dayjs() },
    { label: 'Now', value: () => dayjs() },
  ],
}

const weekRef = ref()
</script>

<template>
  <div>
    <h1>Value: {{ value ? value.format('YYYY-MM-DD HH:mm:ss') : 'null' }}</h1>

    <div style="display: flex; flex-wrap: wrap">
      <div style="margin: 0 8px">
        <h3>Basic</h3>
        <Picker
          v-bind="sharedProps"
          :locale="zhCN"
          suffix-icon="SUFFIX"
          root-class-name="bamboo"
          class-name="little"
          :class-names="{ root: 'light', popup: { container: 'popup-c' } }"
          open
          :styles="{ popup: { container: { backgroundColor: 'red' } } }"
          :value="value"
        />
        <Picker v-bind="sharedProps" :locale="enUS" :value="value" />
      </div>

      <div style="margin: 0 8px">
        <h3>Uncontrolled</h3>
        <Picker
          :generate-config="dayjsGenerateConfig"
          :locale="zhCN"
          allow-clear
          show-today
          :render-extra-footer="() => 'extra'"
        />
      </div>

      <div style="margin: 0 8px">
        <h3>Datetime</h3>
        <Picker
          v-bind="sharedProps"
          :locale="zhCN"
          :default-picker-value="defaultValue.clone().subtract(1, 'month')"
          :show-time="{
            showSecond: false,
            defaultValue: dayjs('11:28:39', 'HH:mm:ss'),
          }"
          show-today
          :disabled-time="(date: Dayjs) => {
            if (date && date.isSame(defaultValue, 'date')) {
              return {
                disabledHours: () => [1, 3, 5, 7, 9, 11],
              };
            }
            return {};
          }"
          change-on-blur
          :value="value"
        />
      </div>

      <div style="margin: 0 8px">
        <h3>Uncontrolled Datetime</h3>
        <Picker
          format="YYYY-MM-DD HH:mm:ss"
          :generate-config="dayjsGenerateConfig"
          :locale="enUS"
          show-time
        />
      </div>

      <div style="margin: 0 8px">
        <h3>Week</h3>
        <Picker
          v-bind="sharedProps"
          ref="weekRef"
          :locale="zhCN"
          allow-clear
          picker="week"
          :render-extra-footer="() => 'I am footer!!!'"
          :value="value"
        />
        <button type="button" @click="weekRef?.focus()">
          Focus
        </button>
      </div>

      <div style="margin: 0 8px">
        <h3>Quarter</h3>
        <Picker
          :generate-config="dayjsGenerateConfig"
          :locale="enUS"
          picker="quarter"
        />
      </div>

      <div style="margin: 0 8px">
        <h3>Time</h3>
        <Picker
          v-bind="sharedProps"
          :locale="zhCN"
          picker="time"
          :value="value"
        />
      </div>

      <div style="margin: 0 8px">
        <h3>Year</h3>
        <Picker
          v-bind="sharedProps"
          :locale="zhCN"
          picker="year"
          :value="value"
        />
      </div>
    </div>
  </div>
</template>

<style src="../assets/index.less"></style>
