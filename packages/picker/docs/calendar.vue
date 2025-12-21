<script setup lang="ts">
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { h } from 'vue'
import dayjsGenerateConfig from '../src/generate/dayjs'
import { Picker, PickerPanel } from '../src/index'
import zhCN from '../src/locale/zh_CN'

function dateRender(date: Dayjs) {
  return h(
    'div',
    {
      style: {
        width: '80px',
        height: '80px',
        borderTop: '3px solid #CCC',
        borderTopColor: date.isSame(dayjs(), 'date') ? 'blue' : '#CCC',
      },
    },
    date.date(),
  )
}

const disabledProps = {
  disabledDate: (date: Dayjs) => date.date() === 10,
  onSelect: (d: Dayjs) => console.log('Select:', d.format('YYYY-MM-DD')),
  onChange: (d: Dayjs) => console.log('Change:', d.format('YYYY-MM-DD')),
}
</script>

<template>
  <div style="display: flex; flex-wrap: wrap">
    <div>
      <PickerPanel
        :locale="zhCN"
        :generate-config="dayjsGenerateConfig"
        :date-render="dateRender"
        v-bind="disabledProps"
      />
    </div>
    <div>
      <Picker
        :locale="zhCN"
        :generate-config="dayjsGenerateConfig"
        :date-render="dateRender"
        v-bind="disabledProps"
      />
    </div>
  </div>
</template>

<style src="../assets/index.less"></style>

<style src="./calendar.less"></style>
