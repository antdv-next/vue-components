<script setup lang="ts">
import type { Moment } from 'moment'
import { h } from 'vue'
import momentGenerateConfig from '../src/generate/moment'
import { Picker, PickerPanel } from '../src/index'
import zhCN from '../src/locale/zh_CN'

function dateRender(date: Moment, today: Moment) {
  return h(
    'div',
    {
      style: {
        width: '80px',
        height: '80px',
        borderTop: '3px solid #CCC',
        borderTopColor: date.isSame(today, 'date') ? 'blue' : '#CCC',
      },
    },
    date.date(),
  )
}

const disabledProps = {
  disabledDate: (date: Moment) => date.date() === 10,
  onSelect: (d: Moment) => console.log('Select:', d.format('YYYY-MM-DD')),
  onChange: (d: Moment) => console.log('Change:', d.format('YYYY-MM-DD')),
}
</script>

<template>
  <div style="display: flex; flex-wrap: wrap">
    <div>
      123
      <PickerPanel
        :locale="zhCN"
        :generate-config="momentGenerateConfig"
        :date-render="dateRender"
        v-bind="disabledProps"
      />
    </div>
    <div>
      <Picker
        :locale="zhCN"
        :generate-config="momentGenerateConfig"
        :date-render="dateRender"
        v-bind="disabledProps"
      />
    </div>
  </div>
</template>

<style src="../assets/index.less"></style>

<style src="./calendar.less"></style>
