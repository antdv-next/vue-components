<script setup lang="ts">
import { ref } from 'vue'
import InputNumber from '../src'

const disabled = ref(false)
const readOnly = ref(false)
const value = ref(50000)
function onChange(data: any) {
  console.log('onChange:', data)
  value.value = data
}

function toggleDisabled() {
  disabled.value = !disabled.value
}

function toggleReadOnly() {
  readOnly.value = !readOnly.value
}

function numberWithCommas(x: any) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function format(num: any) {
  return `$ ${numberWithCommas(num)} boeing737`
}

function parser(num: any) {
  const cells = num.toString().split(' ')
  if (!cells[1]) {
    return num
  }

  return cells[1].replace(/,*/g, '')
}
</script>

<template>
  <div style="margin: 10px">
    <p>
      When number is validate in range, keep formatting.
      Else will flush when blur.
    </p>

    <InputNumber
      v-model:value="value"
      aria-label="Number input example that demonstrates combination key format"
      :min="-8000"
      :max="10000000"
      style="width: 200px"
      :read-only="readOnly"
      :disabled="disabled"
      :auto-focus="false"
      :step="100"
      :formatter="format"
      :parser="parser"
      @change="onChange"
    />
    <p>
      <button type="button" @click="toggleDisabled">
        toggle Disabled
      </button>
      <button type="button" @click="toggleReadOnly">
        toggle readOnly
      </button>
    </p>
  </div>
</template>

<style scoped>

</style>
