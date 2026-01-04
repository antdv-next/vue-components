<script setup lang="ts">
import type { Moment } from 'moment'
import moment from 'moment'
import { cloneVNode, computed, h, ref } from 'vue'
import { Picker, RangePicker } from '../src'
import momentGenerateConfig from '../src/generate/moment'
import zhCN from '../src/locale/zh_CN'

const defaultValue = moment('2019-11-28 01:02:03')
const defaultStartValue = moment('2019-09-03 05:02:03')
const defaultEndValue = moment('2019-11-28 01:02:03')

function formatDate(date: Moment | null) {
  return date ? date.format('YYYY-MM-DD HH:mm:ss') : 'null'
}

const value = ref<Moment | null>(defaultValue)
const rangeValue = ref<[Moment | null, Moment | null] | null>([
  defaultStartValue,
  defaultEndValue,
])

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
    presets: [
      {
        label: 'Hello World!',
        value: moment(),
      },
    ],
  }
})

function onRangeChange(newValue: [Moment | null, Moment | null] | null, formatStrings?: string[]) {
  console.log('Change:', newValue, formatStrings)
  rangeValue.value = newValue
}

const rangeSharedProps = computed(() => {
  return {
    generateConfig: momentGenerateConfig,
    value: rangeValue.value,
    onChange: onRangeChange,
  }
})

function renderOrange(content: string | number, info: any, extraProps: Record<string, any> = {}) {
  return cloneVNode(
    info.originNode,
    extraProps,
    [h('div', { style: { background: 'orange' } }, content)],
  )
}

function rangeCellRender(current: Moment | number | string, info: any) {
  return h(
    'div',
    {
      title: info.type,
      style: { background: info.type === 'time' ? 'green' : 'yellow' },
    },
    info.type === 'time' ? (current as number | string) : (current as Moment).get('date'),
  )
}
</script>

<template>
  <div>
    <div style="display: flex; flex-wrap: wrap;">
      <div style="margin: 0 8px;">
        <h3>Basic</h3>
        <h4>Value: {{ value ? value.format('YYYY-MM-DD HH:mm:ss') : 'null' }}</h4>
        <Picker
          v-bind="sharedProps"
          :locale="zhCN"
          :cell-render="(current, info) => renderOrange(current.get('date'), info)"
        />
        <Picker
          v-bind="sharedProps"
          :locale="zhCN"
          :cell-render="(current, info) => renderOrange(current.get('date'), info, {
            class: [info.originNode.props?.class, 'testWrapper'],
          })"
        />
        <Picker
          v-bind="sharedProps"
          picker="week"
          :locale="zhCN"
          :cell-render="(current, info) => renderOrange(current.get('week'), info)"
        />
        <Picker
          v-bind="sharedProps"
          picker="year"
          :locale="zhCN"
          :cell-render="(current, info) => renderOrange(current.get('year'), info)"
        />
        <Picker
          v-bind="sharedProps"
          picker="month"
          :locale="zhCN"
          :cell-render="(current, info) => renderOrange(current.get('month') + 1, info)"
        />
        <Picker
          v-bind="sharedProps"
          picker="quarter"
          :locale="zhCN"
          :cell-render="(current, info) => renderOrange(`Q${current.get('quarter')}`, info)"
        />
        <Picker
          v-bind="sharedProps"
          picker="time"
          :locale="zhCN"
          :cell-render="(current, info) => renderOrange(current, info)"
        />
      </div>

      <div style="margin: 0 8px;">
        <h3>Range</h3>
        <h4>
          RangeValue:
          {{ rangeValue ? `${formatDate(rangeValue[0])} ~ ${formatDate(rangeValue[1])}` : 'null' }}
        </h4>

        <RangePicker
          v-bind="rangeSharedProps"
          :locale="zhCN"
          allow-clear
          show-time
          style="width: 580px"
          :cell-render="rangeCellRender"
          :ranges="{
            ranges: [moment(), moment().add(10, 'day')],
          }"
          @ok="(dates: unknown) => {
            console.log('OK!!!', dates)
          }"
        />
      </div>
    </div>
  </div>
</template>

<style src="../assets/index.less"></style>
