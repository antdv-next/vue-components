<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { onMounted, ref, useTemplateRef, watch } from 'vue'
import Overflow from '../src'

const responsive = ref(true)
const inputValue = ref('')
const inputWidth = ref(0)
const data = ref(createData(1))
const inputRef = useTemplateRef('input')
const measureRef = useTemplateRef('measure')

watch(inputValue, () => {
  if (measureRef.value)
    inputWidth.value = measureRef.value.offsetWidth
})

onMounted(() => {
  inputRef.value?.focus()
})

const commonStyle: CSSProperties = {
  margin: '0 16px 0 8px',
  padding: '4px 8px',
  background: 'rgba(255, 0, 0, 0.2)',
}

interface ItemType {
  value: string | number
  label: string
}

function createData(count: number): ItemType[] {
  const data: ItemType[] = Array.from({ length: count }).fill(undefined).map((_, index) => ({
    value: index,
    label: `Label ${index}`,
  }))

  return data
}
const inputStyle: CSSProperties = {
  border: 'none',
  fontSize: '12px',
  margin: 0,
  outline: 'none',
  lineHeight: '20px',
  fontFamily: '-apple-system',
  padding: '0 4px',
}
</script>

<template>
  <div style="padding: 32px">
    <button
      type="button"
      @click="() => {
        responsive = !responsive
      }"
    >
      {{ responsive ? 'Responsive' : 'MaxCount: 6' }}
    </button>
    <select
      style="width: 200px; height: 32px"
      :value="data.length"
      @change="({ target: { value } }: any) => {
        data = createData(Number(value));
      }"
    >
      <option value="0">
        0
      </option>
      <option value="1">
        1
      </option>
      <option value="2">
        2
      </option>
      <option value="3">
        3
      </option>
      <option value="5">
        5
      </option>
      <option value="10">
        10
      </option>
      <option value="20">
        20
      </option>
      <option value="200">
        200
      </option>
    </select>

    <div
      style="
        border: 5px solid green;
        padding: 8px;
        max-width: 300px;
        margin-top: 32px;
      "
    >
      <Overflow
        :data="data"
        :max-count="responsive ? 'responsive' : 6"
      >
        <template #renderItem="item">
          <div :style="commonStyle">
            {{ item.label }}
          </div>
        </template>
        <template #renderRest="items">
          <div :style="commonStyle">
            + {{ items.length }}...
          </div>
        </template>
        <template #suffix>
          <div style="position: relative; max-width: 100%">
            <input
              ref="input"
              v-model="inputValue"
              :style="{
                ...inputStyle,
                width: `${inputWidth}px`,
              }"
              style="
                background: rgba(0, 0, 0, 0.1);
                min-width: 10px;
                max-width: 100%;"
            >
            <div
              ref="measure"
              :style="{
                ...inputStyle,
              }"
              style="
                pointer-events: none;
                position: absolute;
                left: 0;
                top: 200%
              "
            >
              {{ inputValue }}
            </div>
          </div>
        </template>
      </Overflow>
    </div>
  </div>
</template>

<style scoped>

</style>
