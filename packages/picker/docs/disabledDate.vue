<script setup lang="ts">
import type { Moment } from 'moment'
import moment from 'moment'
import { computed, ref } from 'vue'
import Picker from '../src'
import momentGenerateConfig from '../src/generate/moment'
import enUS from '../src/locale/en_US'

const value = ref<Moment | null>(null)

function onSelect(newValue: Moment) {
  console.log('Select:', newValue)
}

function onChange(newValue: Moment | null, formatString?: string) {
  console.log('Change:', newValue, formatString)
  value.value = newValue
}

function disabledDateBeforeToday(current: Moment) {
  return current <= moment().endOf('day')
}

function disabledDateAfterToday(current: Moment) {
  return current >= moment().endOf('day')
}

function disabledDateAfterTodayAndBeforeLastYear(current: Moment) {
  return current >= moment().startOf('day') || current < moment().subtract(1, 'years')
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
  <div style="padding-bottom: 20px;">
    <h1>Value: {{ value ? value.format('YYYY-MM-DD HH:mm:ss') : 'null' }}</h1>
    <h2>Date Mode</h2>
    <div style="display: flex; flex-wrap: wrap;">
      <div style="margin: 0 8px;">
        <h3>Before Today</h3>
        <Picker v-bind="sharedProps" :disabled-date="disabledDateBeforeToday" :locale="enUS" />
      </div>
      <div style="margin: 0 8px;">
        <h3>After Today</h3>
        <Picker v-bind="sharedProps" :disabled-date="disabledDateAfterToday" :locale="enUS" />
      </div>
      <div style="margin: 0 8px;">
        <h3>After Today or Before last year</h3>
        <Picker
          v-bind="sharedProps"
          :disabled-date="disabledDateAfterTodayAndBeforeLastYear"
          :locale="enUS"
        />
      </div>
    </div>
  </div>
</template>

<style src="../assets/index.less"></style>
