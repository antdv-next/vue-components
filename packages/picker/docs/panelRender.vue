<script setup lang="ts">
import type { VueNode } from '@v-c/util/dist/type'
import moment from 'moment'
import { h, ref } from 'vue'
import { Picker, RangePicker } from '../src'
import momentGenerateConfig from '../src/generate/moment'
import zhCN from '../src/locale/zh_CN'

const defaultStartValue = moment('2019-09-03 05:02:03')
const defaultEndValue = moment('2019-11-28 01:02:03')
const defaultValue: [typeof defaultStartValue, typeof defaultEndValue] = [
  defaultStartValue,
  defaultEndValue,
]

const customizeNode = ref(false)

function panelRender(node: VueNode) {
  return h('div', [
    h(
      'button',
      {
        type: 'button',
        style: { display: 'block' },
        onClick: () => {
          customizeNode.value = !customizeNode.value
        },
      },
      'Change',
    ),
    customizeNode.value ? h('span', 'My Panel') : node,
  ])
}
</script>

<template>
  <div>
    {{ String(customizeNode) }}
    <div style="display: flex; flex-wrap: wrap;">
      <div>
        <h3>Picker</h3>
        <Picker
          :generate-config="momentGenerateConfig"
          :locale="zhCN"
          allow-clear
          :default-value="defaultStartValue"
          :panel-render="panelRender"
        />
      </div>
      <div>
        <h3>RangePicker</h3>
        <RangePicker
          :generate-config="momentGenerateConfig"
          :locale="zhCN"
          allow-clear
          :default-value="defaultValue"
          :panel-render="panelRender"
        />
      </div>
    </div>
  </div>
</template>

<style src="../assets/index.less"></style>

<style src="./common.less"></style>
