<script setup lang="ts">
import moment from 'moment'
import Picker, { RangePicker } from '../src'
import momentGenerateConfig from '../src/generate/moment'
import zhCN from '../src/locale/zh_CN'

const defaultValue = moment('2019-11-28 01:02:03')
const testClassNames = {
  input: 'test-input',
  prefix: 'test-prefix',
  suffix: 'test-suffix',
  popupContent: 'test-popup-content',
  popupItem: 'test-popup-item',
}
</script>

<template>
  <div>
    <h3>DatePicker</h3>
    <Picker
      :default-value="defaultValue"
      picker="date"
      show-time
      :disabled-time="() => ({
        disabledHours: () => [0, 1, 2, 3, 4, 5, 6, 20, 21],
      })"
      :locale="zhCN"
      :generate-config="momentGenerateConfig"
    />

    <h3>TimePicker</h3>
    <Picker
      :class-names="testClassNames"
      prefix="prefix"
      suffix-icon="suffix"
      :default-value="defaultValue"
      picker="time"
      :locale="zhCN"
      :disabled-time="(now: any) => ({
        disabledHours: () => [now.hours()],
      })"
      :generate-config="momentGenerateConfig"
    />

    <h3>RangePicker</h3>
    <RangePicker
      :default-value="[defaultValue, defaultValue]"
      picker="time"
      :locale="zhCN"
      :generate-config="momentGenerateConfig"
      :disabled-time="(now: any, type: string) => ({
        disabledHours: () => (type === 'start' ? [now.hours()] : [now.hours() - 5]),
      })"
    />

    <h3>PreviewValue is false</h3>
    <RangePicker
      :default-value="[defaultValue, defaultValue]"
      picker="time"
      :locale="zhCN"
      :preview-value="false"
      :generate-config="momentGenerateConfig"
      :disabled-time="(now: any, type: string) => ({
        disabledHours: () => (type === 'start' ? [now.hours()] : [now.hours() - 5]),
      })"
    />
  </div>
</template>

<style src="../assets/index.less"></style>
