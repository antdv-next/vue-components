<script setup lang="ts">
import type { Moment } from 'moment'
import moment from 'moment'
import { computed, ref } from 'vue'
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

const sharedProps = computed(() => {
  return {
    generateConfig: momentGenerateConfig,
    onSelect,
    value: value.value,
    onChange,
    presets: [
      { label: 'Hello World!', value: moment() },
      { label: 'Now', value: () => moment() },
    ],
  }
})

const weekRef = ref<HTMLButtonElement>()

function weekFocus() {
  if (weekRef.value) {
    weekRef.value.focus()
  }
}
function keyDown(e: KeyboardEvent, preventDefault: () => void) {
  if (e.keyCode === 13)
    preventDefault()
}
</script>

<template>
  <div>
    <h1>Value: {{ value ? value.format('YYYY-MM-DD HH:mm:ss') : 'null' }}</h1>

    <div style="display: flex; flex-wrap: wrap">
      <div style="display: flex; height: 300px">
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
          />
          <Picker v-bind="sharedProps" :locale="enUS" />
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

      <div style="margin: 0 8px">
        <h3>Datetime</h3>
        <Picker
          v-bind="sharedProps"
          :locale="zhCN"
          :default-picker-value="defaultValue.clone().subtract(1, 'month')"
          :show-time="{
            showSecond: false,
            defaultValue: moment('11:28:39', 'HH:mm:ss'),
          }"
          show-today
          :disabled-time="
            (date: any) => {
              if (date && date.isSame(defaultValue, 'date')) {
                return {
                  disabledHours: () => [1, 3, 5, 7, 9, 11],
                }
              }

              return {}
            }
          "
          change-on-blur
        />
      </div>

      <div style="margin: 0 8px">
        <h3>Uncontrolled Datetime</h3>
        <Picker
          format="YYYY-MM-DD HH:mm:ss"
          :locale="enUS"
          show-time
          :generate-config="momentGenerateConfig"
        />
      </div>

      <div style="margin: 0 8px">
        <h3>Week</h3>
        <Picker
          ref="weekRef"
          v-bind="sharedProps"
          :locale="zhCN"
          allow-clear
          picker="week"
          :render-extra-footer="() => 'i am footer!!!'"
        />

        <button type="button" @click="weekFocus">
          Focus
        </button>
      </div>

      <div style="margin: 0 8px">
        <h3>Week</h3>
        <Picker
          :locale="enUS"
          picker="week"
          :generate-config="momentGenerateConfig"
        />
      </div>

      <div style="margin: 0 8px">
        <h3>Quarter</h3>
        <Picker
          :locale="zhCN"
          picker="quarter"
          :generate-config="momentGenerateConfig"
        />
      </div>

      <div style="margin: 0 8px;">
        <h3>Time</h3>
        <Picker
          v-bind="sharedProps"
          :locale="enUS"
          picker="time"
        />
      </div>

      <div style="margin: 0 8px;">
        <h3>Time 12</h3>
        <Picker
          v-bind="sharedProps"
          :locale="enUS"
          picker="time"
          :use12-hours="true"
        />
      </div>

      <div style="margin: 0 8px;">
        <h3>Year</h3>
        <Picker
          v-bind="sharedProps"
          :locale="zhCN"
          picker="year"
        />
      </div>

      <div style="margin: 0 8px;">
        <h3>Keyboard navigation (Tab key) disabled</h3>
        <Picker v-bind="sharedProps" :locale="enUS" :tab-index="-1" />
      </div>

      <div style="margin: 0 8px;">
        <h3>Keyboard event with prevent default behaviors</h3>
        <Picker v-bind="sharedProps" :locale="enUS" @keydown="keyDown" />
      </div>

      <div style="margin: 0 8px;">
        <h3>PreviewValue is false</h3>
        <Picker v-bind="sharedProps" :locale="enUS" :preview-value="false" @keydown="keyDown" />
      </div>
    </div>
  </div>
</template>

<style src="../assets/index.less"></style>
