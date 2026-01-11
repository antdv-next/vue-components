<script setup lang="ts">
import type { Moment } from 'moment'
import moment from 'moment'
import { computed, ref } from 'vue'
import Picker from '../src'
import momentGenerateConfig from '../src/generate/moment'
import enUS from '../src/locale/en_US'
import zhCN from '../src/locale/zh_CN'
import 'moment/dist/locale/zh-cn'

const defaultValue = moment('2019-11-28 01:02:03')

const locale = ref(enUS)
const value = ref<Moment | null>(defaultValue)

function onChange(newValue: Moment | null, formatString?: string | string[]) {
  console.log('Change:', newValue, formatString)
  value.value = newValue
}

const sharedProps = computed(() => {
  return {
    generateConfig: momentGenerateConfig,
    value: value.value,
    onChange,
    presets: [
      {
        label: 'Hello World!',
        value: moment(),
      },
      {
        label: 'Now',
        value: () => moment(),
      },
    ],
  }
})

function toggleLocale() {
  console.log(locale.value)
  locale.value = locale.value.locale === 'zh_CN' ? enUS : zhCN
  moment.locale(locale.value.locale === 'zh_CN' ? 'zh-cn' : 'en')
}
</script>

<template>
  <div>
    <Picker v-bind="sharedProps" :locale="locale" format="dddd" />
    <button type="button" @click="toggleLocale">
      {{ locale.locale }}
    </button>
  </div>
</template>

<style src="../assets/index.less"></style>
