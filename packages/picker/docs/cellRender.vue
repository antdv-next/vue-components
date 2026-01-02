<script setup lang="ts">
import type { Moment } from 'moment'
import moment from 'moment'
import { computed, h, ref } from 'vue'
import { RangePicker } from '../src'
import momentGenerateConfig from '../src/generate/moment'
import zhCN from '../src/locale/zh_CN'
import '../assets/index.less'

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
</script>

<template>
  <div>
    <div style="display: flex;flex-wrap: wrap;">
      <!-- <div style="margin: 0 8px;">
        <h3>Basic</h3>
        <h4>Value: {{ value ? value.format('YYYY-MM-DD HH:mm:ss') : 'null' }}</h4>
        <Picker
          v-bind="sharedProps" :locale="zhCN" :cell-render="(current:Moment, info) => {
            return h(info.originNode.type, {
              ...info.originNode.props,
            }, [h('div', { style: 'background: orange;' }, [current.get('date')])])
          }"
        />
        <Picker
          v-bind="sharedProps" :locale="zhCN" :cell-render="(current:Moment, info) => {
            return h(info.originNode.type, {
              class: `${info.originNode.props!.class} testWrapper`,
            }, [h('div', { style: 'background: orange;' }, [current.get('date')])])
          }"
        />
        <Picker
          v-bind="sharedProps" picker="week" :locale="zhCN" :cell-render="(current:Moment, info) => {
            return h(info.originNode.type, {
              ...info.originNode.props,
            }, [h('div', { style: 'background: orange;' }, [current.get('week')])])
          }"
        />
        <Picker
          v-bind="sharedProps" picker="year" :locale="zhCN" :cell-render="(current:Moment, info) => {
            return h(info.originNode.type, {
              ...info.originNode.props,
            }, [h('div', { style: 'background: orange;' }, [current.get('year')])])
          }"
        />
        <Picker
          v-bind="sharedProps" picker="month" :locale="zhCN" :cell-render="(current:Moment, info) => {
            return h(info.originNode.type, {
              ...info.originNode.props,
            }, [h('div', { style: 'background: orange;' }, [current.get('month') + 1])])
          }"
        />
        <Picker
          v-bind="sharedProps" picker="quarter" :locale="zhCN" :cell-render="(current:Moment, info) => {
            return h(info.originNode.type, {
              ...info.originNode.props,
            }, [h('div', { style: 'background: orange;' }, [`Q${current.get('quarter')}`])])
          }"
        />

        <Picker
          v-bind="sharedProps" picker="time" :locale="zhCN" :cell-render="(current:Moment, info) => {
            return h(info.originNode.type, {
              ...info.originNode.props,
            }, [h('div', { style: 'background: orange;' }, [current])])
          }"
        />
      </div> -->

      <div style="margin: 0 8px;">
        <h3>Range</h3>
        <h4>
          RangeValue:
          {{ rangeValue ? `${formatDate(rangeValue[0])} ~ ${formatDate(rangeValue[1])}` : 'null' }}
        </h4>

        <RangePicker
          v-bind="rangeSharedProps" :locale="zhCN" allow-clear show-time style="width: 500px" :cell-render="(current, info) => {
            return h('div', {
              title: info.type,
              style: `background: ${info.type === 'time' ? 'green' : 'yellow'};`,
            }, [info.type === 'time' ? current as number : current.get('date')])
          }"
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
