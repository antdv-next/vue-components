<script setup lang="ts">
import type { Moment } from 'moment'
import moment from 'moment'
import { computed, ref } from 'vue'
import { PickerPanel } from '../src'
import momentGenerateConfig from '../src/generate/moment'
import enUS from '../src/locale/en_US'
import jaJP from '../src/locale/ja_JP'
import zhCN from '../src/locale/zh_CN'

const defaultValue = moment('2019-11-28 01:02:03')

const value = ref<Moment | null>(defaultValue)

function onSelect(newValue: Moment) {
  console.log('Select:', newValue)
}

function onChange(newValue: Moment | null, formatString?: string) {
  console.log('Change:', newValue, formatString)
  value.value = newValue
}

const sharedProps = computed(() => {
  return {
    generateConfig: momentGenerateConfig,
    value: value.value,
    onSelect,
    onChange,
  }
})
</script>

<template>
  <div>
    <h1>Value: {{ value ? value.format('YYYY-MM-DD HH:mm:ss') : 'null' }}</h1>

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
        <h3>Quarter Picker</h3>
        <PickerPanel v-bind="sharedProps" :locale="zhCN" picker="quarter" />
      </div>

      <div style="margin: 0 8px;">
        <h3>Week Picker US</h3>
        <PickerPanel v-bind="sharedProps" :locale="enUS" picker="week" />
      </div>

      <div style="margin: 0 8px;">
        <h3>Time</h3>
        <PickerPanel v-bind="sharedProps" :locale="jaJP" picker="time" />
      </div>
      <div style="margin: 0 8px;">
        <h3>Uncontrolled</h3>
        <PickerPanel v-bind="sharedProps" :locale="jaJP" :value="undefined" picker="time" />
      </div>
      <div style="margin: 0 8px;">
        <h3>Time AM/PM</h3>
        <PickerPanel
          v-bind="sharedProps"
          :locale="jaJP"
          picker="time"
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
  </div>
</template>

<style src="../assets/index.less"></style>
