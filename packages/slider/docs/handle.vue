<script setup lang="ts">
import type { CSSProperties } from 'vue'
import Slider from '@v-c/slider'
import TooltipSlider, { HandleRender } from './TooltipSlider.tsx'

const wrapperStyle: CSSProperties = {
  width: '400px',
  margin: '50px',
}
</script>

<template>
  <div>
    <div :style="wrapperStyle">
      <p>Slider with custom handle</p>
      <Slider :min="0" :max="20" :default-value="3" :handle-render="HandleRender" />
    </div>
    <div :style="wrapperStyle">
      <p>Reversed Slider with custom handle</p>
      <Slider :min="0" :max="20" reverse :default-value="3" :handle-render="HandleRender"/>
    </div>
    <div :style="wrapperStyle">
      <p>Slider with fixed values</p>
      <Slider :min="20" :default-value="20" :marks="{ 20: 20, 40: 40, 100: 100 }" :step="null" />
    </div>
    <div :style="wrapperStyle">
      <p>Range with custom tooltip</p>
      <TooltipSlider
        range
        :min="0"
        :max="20"
        :default-value="[3, 10]"
        :tip-formatter="(value) => (`${value}!`)"
      />
    </div>
    <div :style="wrapperStyle">
      <p>Keyboard events disabled</p>
      <Slider :default-value="3" :keyboard="false" />
    </div>
  </div>
</template>

<style scoped>

</style>
