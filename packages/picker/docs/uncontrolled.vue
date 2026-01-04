<script setup lang="ts">
import Picker, { RangePicker } from '../src'
import momentGenerateConfig from '../src/generate/moment'
import zhCN from '../src/locale/zh_CN'

function logOpenChange(label: string, open: boolean) {
  console.log(`${label} =>`, open)
}
</script>

<template>
  <div>
    <div style="margin: 0 8px;">
      <h3>Uncontrolled</h3>
      <Picker
        :generate-config="momentGenerateConfig"
        :locale="zhCN"
        picker="week"
        allow-clear
        @open-change="(open: boolean) => logOpenChange('1', open)"
      />
      <Picker
        :generate-config="momentGenerateConfig"
        :locale="zhCN"
        picker="week"
        allow-clear
        open
        @open-change="(open: boolean) => logOpenChange('2', open)"
      />
      <RangePicker
        :generate-config="momentGenerateConfig"
        :locale="zhCN"
        picker="week"
        allow-clear
        @open-change="(open: boolean) => logOpenChange('3', open)"
      />
      <button type="button">
        233
      </button>
    </div>
  </div>
</template>

<style src="../assets/index.less"></style>
