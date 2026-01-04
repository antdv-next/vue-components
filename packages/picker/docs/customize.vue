<script setup lang="ts">
import type { Moment } from 'moment'
import moment from 'moment'
import { h, ref } from 'vue'
import Picker, { PickerPanel } from '../src'
import momentGenerateConfig from '../src/generate/moment'
import zhCN from '../src/locale/zh_CN'

const now = moment()

const popupContainerRef = ref<HTMLDivElement | null>(null)

const startValue = ref<Moment | null>(null)
const endValue = ref<Moment | null>(null)
const endOpen = ref(false)

function disabledStartDate(start: Moment) {
  if (!start || !endValue.value) {
    return false
  }
  return start.valueOf() > endValue.value.valueOf()
}

function disabledEndDate(end: Moment) {
  if (!end || !startValue.value) {
    return false
  }
  return end.valueOf() <= startValue.value.valueOf()
}

function onStartChange(value: Moment | null) {
  startValue.value = value
}

function onEndChange(value: Moment | null) {
  endValue.value = value
}

function handleStartOpenChange(open: boolean) {
  if (!open) {
    console.error('Start Trigger end open:', open)
    endOpen.value = true
  }
}

function handleEndOpenChange(open: boolean) {
  console.error('End Trigger end open:', open)
  endOpen.value = open
}

function getPopupContainer(_node: HTMLElement) {
  console.log(_node, 2333)
  return popupContainerRef.value as HTMLDivElement
}

function monthCellRender(date: Moment) {
  return h(
    'div',
    {
      style: {
        width: '60px',
        height: '40px',
        borderTop: '3px solid #CCC',
      },
    },
    date.month() + 1,
  )
}
</script>

<template>
  <div>
    <div
      style="
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
      "
    >
      <div>
        <h3>custom icon</h3>
        <Picker
          :generate-config="momentGenerateConfig"
          :locale="zhCN"
          :get-popup-container="getPopupContainer"
          :format="['YYYY-MM-DD', 'YYYY/MM/DD']"
          allow-clear
          prefix="Foobar"
          :clear-icon="h('span', {}, 'X')"
          :suffix-icon="h('span', {}, 'O')"
          :prev-icon="h('span', {}, '<')"
          :next-icon="h('span', {}, '>')"
          :super-prev-icon="h('span', {}, '<<')"
          :super-next-icon="h('span', {}, '>>')"
          placeholder="please select"
          style="width: 200px; height: 28px"
        />
        <div ref="popupContainerRef" />
      </div>
      <div>
        <h3>monthCellRender</h3>
        <PickerPanel
          :generate-config="momentGenerateConfig"
          :locale="zhCN"
          picker="month"
          :month-cell-render="monthCellRender"
        />
      </div>
    </div>
    <Picker
      :generate-config="momentGenerateConfig"
      :locale="zhCN"
      :default-value="now"
      :disabled-date="disabledStartDate"
      show-time
      format="YYYY-MM-DD HH:mm:ss"
      :value="startValue"
      placeholder="Start"
      :on-change="onStartChange"
      :on-open-change="handleStartOpenChange"
      transition-name="slide-up"
    />
    <Picker
      :generate-config="momentGenerateConfig"
      :disabled-date="disabledEndDate"
      :locale="zhCN"
      show-time
      format="YYYY-MM-DD HH:mm:ss"
      :value="endValue"
      placeholder="End"
      :on-change="onEndChange"
      :open="endOpen"
      :on-open-change="handleEndOpenChange"
      transition-name="slide-up"
    />
  </div>
</template>

<style src="../assets/index.less"></style>

<style src="./slide.less"></style>
