<script setup lang="ts">
import type { CSSProperties } from 'vue'
import Slider from '@v-c/slider'
import { reactive, ref } from 'vue'

const data1 = ref([0, 20])
const data2 = ref([0, 20])
const data3 = ref([20, 20])
const data4 = ref([20, 40])
const data5 = ref([0, 20])
const data6 = ref([20, 40, 60, 80])
const data7 = ref([20, 40, 60, 80])
const data10 = ref([20, 50])
const data11 = ref([20, 40, 60, 80])
const data12 = ref([0, 40])
const data13 = ref([0, 40])
const data14 = ref([0, 20, 30, 40, 50])

const style: CSSProperties = {
  width: '400px',
  margin: '50px',
}

function log(value: unknown) {
  console.log(value)
}

// CustomizedRange组件
const customizedRange = reactive({
  lowerBound: 20,
  upperBound: 40,
  value: [20, 40],
})

function onLowerBoundChange(e: any) {
  customizedRange.lowerBound = +e.target.value
}

function onUpperBoundChange(e: any) {
  customizedRange.upperBound = +e.target.value
}

function onSliderChange(value: any) {
  log(value)
  customizedRange.value = value
}

function handleApply() {
  const { lowerBound, upperBound } = customizedRange
  customizedRange.value = [lowerBound, upperBound]
}

// DynamicBounds组件
const dynamicBounds = reactive({
  min: 0,
  max: 100,
})

function onDynamicSliderChange(value: unknown) {
  log(value)
}

function onMinChange(e: any) {
  dynamicBounds.min = +e.target.value || 0
}

function onMaxChange(e: any) {
  dynamicBounds.max = +e.target.value || 100
}

// ControlledRange组件
const controlledRangeValue = ref([20, 40, 60, 80])

function handleControlledRangeChange(value: any) {
  controlledRangeValue.value = value
}

// ControlledRangeDisableAcross组件
const controlledRangeDisableAcrossValue = ref([20, 40, 60, 80])

function handleControlledRangeDisableAcrossChange(value: any) {
  controlledRangeDisableAcrossValue.value = value
}

// PureRenderRange组件
const pureRenderRangeFoo = ref(false)

function handlePureRenderRangeChange(value: any) {
  console.log(value)
  pureRenderRangeFoo.value = !pureRenderRangeFoo.value
}
</script>

<template>
  <div>
    <div :style="style">
      <p>Basic Range，`allowCross=false`</p>
      <Slider v-model:value="data1" range :allow-cross="false" @change="log" />
    </div>
    <div :style="style">
      <p>Basic reverse Range`</p>
      <Slider v-model:value="data2" range :allow-cross="false" reverse @change="log" />
    </div>
    <div :style="style">
      <p>Basic Range，`step=20` </p>
      <Slider v-model:value="data3" range :step="20" @before-change="log" />
    </div>
    <div :style="style">
      <p>Basic Range，`step=20, dots` </p>
      <Slider v-model:value="data4" range dots :step="20" @change-complete="log" />
    </div>
    <div :style="style">
      <p>Basic Range，disabled</p>
      <Slider v-model:value="data5" range :allow-cross="false" disabled @change="log" />
    </div>
    <div :style="style">
      <p>Controlled Range</p>
      <Slider range :value="controlledRangeValue" @change="handleControlledRangeChange" />
    </div>
    <div :style="style">
      <p>Controlled Range, not allow across</p>
      <Slider
        range
        :value="controlledRangeDisableAcrossValue"
        :allow-cross="false"
        @change="handleControlledRangeDisableAcrossChange"
      />
    </div>
    <div :style="style">
      <p>Controlled Range, not allow across, pushable=5</p>
      <Slider
        range
        :value="controlledRangeDisableAcrossValue"
        :allow-cross="false"
        :pushable="5"
        @change="handleControlledRangeDisableAcrossChange"
      />
    </div>
    <div :style="style">
      <p>Multi Range, count=3 and pushable=true</p>
      <Slider v-model:value="data6" range :count="3" pushable />
    </div>
    <div :style="style">
      <p>Multi Range with custom track and handle style and pushable</p>
      <Slider
        v-model:value="data7"
        range
        :count="3"
        pushable
        :track-style="[{ backgroundColor: 'red' }, { backgroundColor: 'green' }]"
        :handle-style="[{ backgroundColor: 'yellow' }, { backgroundColor: 'gray' }]"
        :rail-style="{ backgroundColor: 'black' }"
      />
    </div>
    <div :style="style">
      <p>Customized Range</p>
      <div>
        <label>LowerBound: </label>
        <input type="number" :value="customizedRange.lowerBound" @change="onLowerBoundChange">
        <br>
        <label>UpperBound: </label>
        <input type="number" :value="customizedRange.upperBound" @change="onUpperBoundChange">
        <br>
        <button type="button" @click="handleApply">
          Apply
        </button>
        <br>
        <br>
        <Slider range :allow-cross="false" :value="customizedRange.value" @change="onSliderChange" />
      </div>
    </div>
    <div :style="style">
      <p>Range with dynamic `max` `min`</p>
      <div>
        <label>Min: </label>
        <input type="number" :value="dynamicBounds.min" @change="onMinChange">
        <br>
        <label>Max: </label>
        <input type="number" :value="dynamicBounds.max" @change="onMaxChange">
        <br>
        <br>
        <Slider
          v-model:value="data10"
          range
          :min="dynamicBounds.min"
          :max="dynamicBounds.max"
          @change="onDynamicSliderChange"
        />
      </div>
    </div>
    <div :style="style">
      <p>Range as child component</p>
      <Slider
        v-model:value="data11"
        range
        :allow-cross="false"
        @change="handlePureRenderRangeChange"
      />
    </div>
    <div :style="style">
      <p>draggableTrack two points</p>
      <Slider v-model:value="data12" :range="{ draggableTrack: true }" :allow-cross="false" @change="log" />
    </div>
    <div :style="style">
      <p>draggableTrack two points(reverse)</p>
      <Slider
        v-model:value="data13"
        :range="{ draggableTrack: true }"
        :allow-cross="false"
        reverse
        @change="log"
      />
    </div>
    <div :style="style">
      <p>draggableTrack multiple points</p>
      <Slider
        v-model:value="data14"
        :range="{ draggableTrack: true }"
        :allow-cross="false"
        @change="log"
      />
    </div>
  </div>
</template>
