<script setup lang="ts">
import type { CSSProperties } from 'vue'
import Slider from '@v-c/slider'
import { ref } from 'vue'

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

// 创建响应式数据
const data1 = ref(20)
const data2 = ref(20)
const data3 = ref(20)
const data4 = ref(20)
const data5 = ref(20)
const data6 = ref(20)
const data7 = ref([20, 40])
const data8 = ref([20, 40])
const data9 = ref([20, 40])
const data10 = ref([20, 40])

function log(value: unknown) {
  console.log(value)
}
</script>

<template>
  <div :style="parentStyle">
    <div :style="style">
      <p>Slider with marks, `step=null`</p>
      <Slider v-model:value="data1" vertical :min="-10" :marks="marks" :step="null" @change="log" />
    </div>
    <div :style="style">
      <p>Slider with marks, `step=null` and `startPoint=0`</p>
      <Slider
        v-model:value="data2"
        vertical
        :min="-10"
        :start-point="0"
        :marks="marks"
        :step="null"
        @change="log"
      />
    </div>
    <div :style="style">
      <p>Reverse Slider with marks, `step=null`</p>
      <Slider
        v-model:value="data3"
        vertical
        :min="-10"
        :marks="marks"
        :step="null"
        reverse
        @change="log"
      />
    </div>
    <div :style="style">
      <p>Slider with marks and steps</p>
      <Slider v-model:value="data4" vertical dots :min="-10" :marks="marks" :step="10" @change="log" />
    </div>
    <div :style="style">
      <p>Slider with marks, `included=false`</p>
      <Slider v-model:value="data5" vertical :min="-10" :marks="marks" :included="false" />
    </div>
    <div :style="style">
      <p>Slider with marks and steps, `included=false`</p>
      <Slider v-model:value="data6" vertical :min="-10" :marks="marks" :step="10" :included="false" />
    </div>
    <div :style="style">
      <p>Range with marks</p>
      <Slider v-model:value="data7" range vertical :min="-10" :marks="marks" @change="log" />
    </div>
    <div :style="style">
      <p>Range with marks and steps</p>
      <Slider
        v-model:value="data8"
        range
        vertical
        :min="-10"
        :marks="marks"
        :step="10"
        @change="log"
      />
    </div>
    <div :style="style">
      <p>Range with marks and draggableTrack</p>
      <Slider
        v-model:value="data9"
        :range="{ draggableTrack: true }"
        vertical
        :min="-10"
        :marks="marks"
        @change="log"
      />
    </div>
    <div :style="style">
      <p>Range with marks and draggableTrack(reverse)</p>
      <Slider
        v-model:value="data10"
        :range="{ draggableTrack: true }"
        vertical
        reverse
        :min="-10"
        :marks="marks"
        @change="log"
      />
    </div>
  </div>
</template>

<style scoped>

</style>
