<script setup lang="ts">
import type { UnstableContextProps } from '../src/context'
import { ref } from 'vue'
import Slider from '../src'

const style = {
  width: '400px',
  margin: '50px',
}

const value = ref([0, 50, 80])

function onDragStart(info: Parameters<UnstableContextProps['onDragStart']>[0]) {
  const { rawValues } = info
  console.log('Start:', rawValues)
}

function onDragChange(info: Parameters<UnstableContextProps['onDragChange']>[0]) {
  const { rawValues } = info
  console.log('Move:', rawValues)
}

function handleChange(nextValue: number[]) {
  console.error('Change:', nextValue)
  value.value = nextValue
}

function handleChangeComplete(nextValue: number[]) {
  console.log('Complete', nextValue)
}
</script>

<template>
  <div>
    <div :style="style">
      <Slider
        :range="{
          editable: true,
          minCount: 1,
          maxCount: 4,
        }"
        :min="0"
        :max="100"
        :value="value"
        :styles="{
          rail: {
            background: 'linear-gradient(to right, blue, red)',
          },
          track: {
            background: 'orange',
          },
        }"
        @change="handleChange"
        @change-complete="handleChangeComplete"
      />
    </div>
    <p>Here is a word that drag should not select it</p>
  </div>
</template>
