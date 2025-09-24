<script setup lang="ts">
import type { CSSProperties } from 'vue'
import Slider from '@v-c/slider'
import { ref } from 'vue'

const data1 = ref(20)
const data2 = ref([-10, 0])
const data3 = ref(20)
const data4 = ref(20)
const data5 = ref(20)
const data6 = ref(20)
const data7 = ref([20, 25, 35, 40])
const data8 = ref([20, 40])

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

function log(value: unknown) {
  console.log(value)
}
</script>

<template>
  <div>
    <div :style="style">
      <p>Slider with marks, `step=null`</p>
      <Slider
        v-model:value="data1"
        :min="-10"
        :marks="marks"
        :step="null"
        @change="log"
        @change-complete="(v) => console.log('AfterChange', v)"
      >
        <template #mark="{ point, label }">
          <template v-if="point === 100">
            <strong>{{ label }}</strong>
          </template>
          <template v-else>
            {{ label }}
          </template>
        </template>
      </Slider>
    </div>

    <div :style="style">
      <p>Range Slider with marks, `step=null`, pushable, draggableTrack</p>
      <Slider
        v-model:value="data2"
        range
        :min="-10"
        :marks="marks"
        :step="null"
        :allow-cross="false"
        pushable
        @change="log"
        @change-complete="(v) => console.log('AfterChange', v)"
      />
    </div>

    <div :style="style">
      <p>Slider with marks and steps</p>
      <Slider v-model:value="data3" dots :min="-10" :marks="marks" :step="10" @change="log" />
    </div>
    <div :style="style">
      <p>Reversed Slider with marks and steps</p>
      <Slider v-model:value="data4" dots reverse :min="-10" :marks="marks" :step="10" @change="log" />
    </div>

    <div :style="style">
      <p>Slider with marks, `included=false`</p>
      <Slider v-model:value="data5" :min="-10" :marks="marks" :included="false" />
    </div>
    <div :style="style">
      <p>Slider with marks and steps, `included=false`</p>
      <Slider v-model:value="data6" :min="-10" :marks="marks" :step="10" :included="false" />
    </div>

    <div :style="style">
      <p>Range with marks</p>
      <Slider v-model:value="data7" range :min="-10" :marks="marks" @change="log" />
    </div>
    <div :style="style">
      <p>Range with marks and steps</p>
      <Slider v-model:value="data8" range :min="-10" :marks="marks" :step="10" @change="log" />
    </div>
  </div>
</template>
