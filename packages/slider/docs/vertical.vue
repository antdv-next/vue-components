<script setup lang="ts">
import type { CSSProperties } from 'vue'
import Slider from '@v-c/slider'

const style: CSSProperties = {
  float: 'left',
  width: '160px',
  height: '400px',
  marginBottom: '160px',
  marginLeft: '50px',
}

const parentStyle: CSSProperties = {
  overflow: 'hidden',
}

const marks = {
  '-10': '-10°C',
  '0': '0°C',
  '26': '26°C',
  '37': '37°C',
  '50': '50°C',
  '100': {
    style: {
      color: 'red',
    },
    label: '100°C',
  },
}

function log(value) {
  console.log(value); //eslint-disable-line
}
</script>

<template>
  <div :style="parentStyle">
    <div :style="style">
      <p>Slider with marks, `step=null`</p>
      <Slider vertical :min="-10" :marks="marks" :step="null" :default-value="20" @change="log" />
    </div>
    <div :style="style">
      <p>Slider with marks, `step=null` and `startPoint=0`</p>
      <Slider
        vertical
        :min="-10"
        :start-point="0"
        :marks="marks"
        :step="null"
        :default-value="20"
        @change="log"
      />
    </div>
    <div :style="style">
      <p>Reverse Slider with marks, `step=null`</p>
      <Slider
        vertical
        :min="-10"
        :marks="marks"
        :step="null"
        :default-value="20"
        reverse
        @change="log"
      />
    </div>
    <div :style="style">
      <p>Slider with marks and steps</p>
      <Slider vertical dots :min="-10" :marks="marks" :step="10" :default-value="20" @change="log" />
    </div>
    <div :style="style">
      <p>Slider with marks, `included=false`</p>
      <Slider vertical :min="-10" :marks="marks" :included="false" :default-value="20" />
    </div>
    <div :style="style">
      <p>Slider with marks and steps, `included=false`</p>
      <Slider vertical :min="-10" :marks="marks" :step="10" :included="false" :default-value="20" />
    </div>
    <div :style="style">
      <p>Range with marks</p>
      <Slider range vertical :min="-10" :marks="marks" :default-value="[20, 40]" @change="log" />
    </div>
    <div :style="style">
      <p>Range with marks and steps</p>
      <Slider
        range
        vertical
        :min="-10"
        :marks="marks"
        :step="10"
        :default-value="[20, 40]"
        @change="log"
      />
    </div>
    <div :style="style">
      <p>Range with marks and draggableTrack</p>
      <Slider
        :range="{ draggableTrack: true }"
        vertical
        :min="-10"
        :marks="marks"
        :default-value="[20, 40]"
        @change="log"
      />
    </div>
    <div :style="style">
      <p>Range with marks and draggableTrack(reverse)</p>
      <Slider
        :range="{ draggableTrack: true }"
        vertical
        reverse
        :min="-10"
        :marks="marks"
        :default-value="[20, 40]"
        @change="log"
      />
    </div>
  </div>
</template>

<style scoped>

</style>
