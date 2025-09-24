<script setup lang="ts">
import type { CSSProperties } from 'vue'
import Slider from '@v-c/slider'
import { ref } from 'vue'
import TooltipSlider, { HandleRender } from './TooltipSlider.tsx'

const data1 = ref(3)
const data2 = ref(3)
const data3 = ref(20)
const data4 = ref([3, 10])
const data5 = ref(3)
const wrapperStyle: CSSProperties = {
  width: '400px',
  margin: '50px',
}
</script>

<template>
  <div>
    <div :style="wrapperStyle">
      <p>Slider with custom handle</p>
      <Slider v-model:value="data1" :min="0" :max="20" :handle-render="HandleRender" />
    </div>
    <div :style="wrapperStyle">
      <p>Reversed Slider with custom handle</p>
      <Slider v-model:value="data2" :min="0" :max="20" reverse :handle-render="HandleRender" />
    </div>
    <div :style="wrapperStyle">
      <p>Slider with fixed values</p>
      <Slider v-model:value="data3" :min="20" :marks="{ 20: 20, 40: 40, 100: 100 }" :step="null" />
    </div>
    <div :style="wrapperStyle">
      <p>Range with custom tooltip</p>
      <TooltipSlider
        v-model:value="data4"
        range
        :min="0"
        :max="20"
        :tip-formatter="(value) => (`${value}!`)"
      />
    </div>
    <div :style="wrapperStyle">
      <p>Keyboard events disabled</p>
      <Slider v-model:value="data5" :keyboard="false" />
    </div>
  </div>
</template>

<style scoped>

</style>
