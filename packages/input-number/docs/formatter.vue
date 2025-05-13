<script setup lang="ts">
import { ref } from 'vue'
import InputNumber from '../src'

function getSum(str) {
  let total = 0
  str.split('').forEach((c) => {
    const num = Number(c)

    if (!Number.isNaN(num)) {
      total += num
    }
  })

  return total
}

const CHINESE_NUMBERS = '零一二三四五六七八九'

function chineseParser(text: string) {
  const parsed = [...text]
    .map((cell) => {
      const index = CHINESE_NUMBERS.indexOf(cell)
      if (index !== -1) {
        return index
      }

      return cell
    })
    .join('')

  if (Number.isNaN(Number(parsed))) {
    return text
  }

  return parsed
}

function chineseFormatter(value: string) {
  return [...value]
    .map((cell) => {
      const index = Number(cell)
      if (!Number.isNaN(index)) {
        return CHINESE_NUMBERS[index]
      }

      return cell
    })
    .join('')
}

const value = ref(1000)

function onChange(val: any) {
  console.log(val)
  value.value = val
}
</script>

<template>
  <div style="margin: 10px">
    <InputNumber
      aria-label="Controlled number input demonstrating a custom currency format"
      :default-value="1000"
      :formatter="(val) => `$ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
      @change="console.log"
    />
    <InputNumber
      aria-label="Controlled number input demonstrating a custom percentage format"
      :default-value="100"
      :formatter="(val) => `${val}%`"
      :parser="(val) => val.replace('%', '')"
      @change="console.log"
    />
    <InputNumber
      aria-label="Controlled number input demonstrating a custom format to add commas"
      style="width: 100px"
      :formatter="(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
      @change="console.log"
    />

    <div>
      <h1>In Control</h1>
      <InputNumber
        v-model:value="value"
        aria-label="Controlled number input demonstrating a custom format"
        :formatter="(val, { userTyping, input }) => {
          if (userTyping) {
            return input;
          }
          return `$ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }"
        @change="onChange"
      />

      <InputNumber
        v-model:value="value"
        aria-label="Controlled number input demonstrating a custom format"
        :parser="chineseParser"
        :formatter="chineseFormatter"
        @change="onChange"
      />
    </div>

    <div>
      <h1>Strange Format</h1>
      <InputNumber
        aria-label="Number input example demonstrating a strange custom format"
        :default-value="1000"
        :formatter="(val) => `$ ${val} - ${getSum(val)}`"
        :parser="(val) => (val.match(/^\$ ([\d.]*) .*$/) || [])[1]"
        @change="console.log"
      />
    </div>
  </div>
</template>

<style scoped>
</style>
