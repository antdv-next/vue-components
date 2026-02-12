<script setup lang="ts">
import type { Dayjs } from 'dayjs'
import type { Moment } from 'moment'
import dayjs from 'dayjs'
import moment from 'moment'
import { ref } from 'vue'
import Picker, { RangePicker } from '../src'
import dayjsGenerateConfig from '../src/generate/dayjs'
import momentGenerateConfig from '../src/generate/moment'
import enUS from '../src/locale/en_US'

type DateLike = Dayjs | Moment
type MaybeText = string | DateLike | null
type MaybeTextRange = [string | null, string | null] | null

function normalizeDateText(value: MaybeText) {
  if (value === null) {
    return null
  }

  if (typeof value === 'string') {
    return value
  }

  return value.format('YYYY-MM-DD')
}

function normalizeRangeText(value: unknown): MaybeTextRange {
  if (!Array.isArray(value)) {
    return null
  }

  return [
    normalizeDateText((value[0] ?? null) as MaybeText),
    normalizeDateText((value[1] ?? null) as MaybeText),
  ]
}

const momentSingleValue = ref<string | null>('2026-02-12')
const dayjsSingleValue = ref<string | null>('2026-02-12')

const momentRangeValue = ref<MaybeTextRange>(['2026-02-01', '2026-02-12'])
const dayjsRangeValue = ref<MaybeTextRange>(['2026-02-01', '2026-02-12'])

function onMomentSingleChange(value: MaybeText, dateString: string | string[]) {
  momentSingleValue.value = normalizeDateText(value)
  console.log('[valueFormat][moment][single]', value, dateString)
}

function onDayjsSingleChange(value: MaybeText, dateString: string | string[]) {
  dayjsSingleValue.value = normalizeDateText(value)
  console.log('[valueFormat][dayjs][single]', value, dateString)
}

function onMomentRangeChange(value: unknown, dateString: [string, string]) {
  momentRangeValue.value = normalizeRangeText(value)
  console.log('[valueFormat][moment][range]', value, dateString)
}

function onDayjsRangeChange(value: unknown, dateString: [string, string]) {
  dayjsRangeValue.value = normalizeRangeText(value)
  console.log('[valueFormat][dayjs][range]', value, dateString)
}

// Keep references to both libraries to avoid tree-shaking side effects in examples.
console.log('[valueFormat][now]', moment().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD'))
</script>

<template>
  <div style="display: flex; flex-wrap: wrap; gap: 16px;">
    <div style="width: 420px;">
      <h3>Single Picker (moment + valueFormat)</h3>
      <div>value: {{ momentSingleValue ?? 'null' }}</div>
      <Picker
        :value="momentSingleValue"
        value-format="YYYY-MM-DD"
        format="YYYY-MM-DD"
        :locale="enUS"
        :generate-config="momentGenerateConfig"
        allow-clear
        @change="onMomentSingleChange"
      />
    </div>

    <div style="width: 420px;">
      <h3>Single Picker (dayjs + valueFormat)</h3>
      <div>value: {{ dayjsSingleValue ?? 'null' }}</div>
      <Picker
        :value="dayjsSingleValue"
        value-format="YYYY-MM-DD"
        format="YYYY-MM-DD"
        :locale="enUS"
        :generate-config="dayjsGenerateConfig"
        allow-clear
        @change="onDayjsSingleChange"
      />
    </div>

    <div style="width: 520px;">
      <h3>Range Picker (moment + valueFormat)</h3>
      <div>value: {{ momentRangeValue ? `${momentRangeValue[0]} ~ ${momentRangeValue[1]}` : 'null' }}</div>
      <RangePicker
        :value="momentRangeValue"
        value-format="YYYY-MM-DD"
        format="YYYY-MM-DD"
        :locale="enUS"
        :generate-config="momentGenerateConfig"
        allow-clear
        @change="onMomentRangeChange"
      />
    </div>

    <div style="width: 520px;">
      <h3>Range Picker (dayjs + valueFormat)</h3>
      <div>value: {{ dayjsRangeValue ? `${dayjsRangeValue[0]} ~ ${dayjsRangeValue[1]}` : 'null' }}</div>
      <RangePicker
        :value="dayjsRangeValue"
        value-format="YYYY-MM-DD"
        format="YYYY-MM-DD"
        :locale="enUS"
        :generate-config="dayjsGenerateConfig"
        allow-clear
        @change="onDayjsRangeChange"
      />
    </div>
  </div>
</template>

<style src="../assets/index.less"></style>
