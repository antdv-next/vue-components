<script setup lang="ts">
import type { CSSProperties } from 'vue'
import Slider from '@v-c/slider'

const style: CSSProperties = {
  width: '400px',
  margin: '50px',
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
  <div>
    <div :style="style">
      <p>Slider with marks, `step=null`</p>
      <Slider
        :min="-10"
        :marks="marks"
        :step="null"
        :default-value="20"
        @change="log"
        @change-complete="(v) => console.log('AfterChange', v)"
      />
    </div>

    <div :style="style">
      <p>Range Slider with marks, `step=null`, pushable, draggableTrack</p>
      <Slider
        range
        :min="-10"
        :marks="marks"
        :step="null"
        :default-value="[-10, 0]"
        :allow-cross="false"
        pushable
        @change="log"
        @change-complete="(v) => console.log('AfterChange', v)"
      />
    </div>

    <div :style="style">
      <p>Slider with marks and steps</p>
      <Slider dots :min="-10" :marks="marks" :step="10" :default-value="20" @change="log" />
    </div>
    <div :style="style">
      <p>Reversed Slider with marks and steps</p>
      <Slider dots reverse :min="-10" :marks="marks" :step="10" :default-value="20" @change="log" />
    </div>

    <div :style="style">
      <p>Slider with marks, `included=false`</p>
      <Slider :min="-10" :marks="marks" :included="false" :default-value="20" />
    </div>
    <div :style="style">
      <p>Slider with marks and steps, `included=false`</p>
      <Slider :min="-10" :marks="marks" :step="10" :included="false" :default-value="20" />
    </div>

    <div :style="style">
      <p>Range with marks</p>
      <Slider range :min="-10" :marks="marks" :default-value="[20, 25, 30, 40]" @change="log" />
    </div>
    <div :style="style">
      <p>Range with marks and steps</p>
      <Slider range :min="-10" :marks="marks" :step="10" :default-value="[20, 40]" @change="log" />
    </div>
  </div>
</template>
