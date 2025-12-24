<script setup lang="ts">
import type { Moment } from 'moment'
import moment from 'moment'
import { ref } from 'vue'
import momentGenerateConfig from '../src/generate/moment'
import Picker from '../src/index'
import enUS from '../src/locale/en_US'
import zhCN from '../src/locale/zh_CN'

const defaultValue = moment('2019-11-28 01:02:03')
const value = ref<Moment | null>(defaultValue)

function onChange(val: Moment | null, dateString: string) {
  console.log('Change:', val, dateString)
  value.value = val
}

function onSelect(val: Moment) {
  console.log('Select:', val)
}

const sharedProps = {
  generateConfig: momentGenerateConfig,
  onSelect,
  onChange,
  presets: [
    { label: 'Hello World!', value: moment() },
    { label: 'Now', value: () => moment() },
  ],
}

const weekRef = ref()
</script>

<template>
  <div>
    <h1>Value: {{ value ? value.format('YYYY-MM-DD HH:mm:ss') : 'null' }}</h1>

    <div style="display: flex; flex-wrap: wrap">
      <div style="margin: 0 8px">
        <h3>Basic</h3>
        <Picker
          v-bind="sharedProps"
          :locale="zhCN"
          suffix-icon="SUFFIX"
          root-class-name="bamboo"
          class="little"
          :class-names="{ root: 'light', popup: { container: 'popup-c' } }"
          open
          :styles="{ popup: { container: { backgroundColor: 'red' } } }"
          :value="value"
        />
        <Picker v-bind="sharedProps" :locale="enUS" :value="value" />
      </div>

      <div style="margin: 0 8px">
        <h3>Uncontrolled</h3>
        <Picker
          :generate-config="momentGenerateConfig"
          :locale="zhCN"
          allow-clear
          show-today
          :render-extra-footer="() => 'extra'"
        />
      </div>
    </div>
  </div>
</template>

<style src="../assets/index.less"></style>
