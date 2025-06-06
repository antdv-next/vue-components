<script setup lang="ts">
import type { CSSProperties } from 'vue'
import Slider from '@v-c/slider'
import { ref } from 'vue'
import TooltipSlider from './TooltipSlider'

const style: CSSProperties = {
  width: '600px',
  margin: '50px',
}

function log(value: unknown) {
  console.log(value) //eslint-disable-line
}

function percentFormatter(v: unknown) {
  return `${v} %`
}

// NullableSlider组件
const nullableSliderValue = ref(null)

function onNullableSliderChange(newValue: any) {
  log(newValue)
  nullableSliderValue.value = newValue
}

function onNullableSliderAfterChange(newValue: unknown) {
  console.log(newValue) //eslint-disable-line
}

function resetNullableSlider() {
  console.log('reset value')
  nullableSliderValue.value = null
}

// NullableRangeSlider组件
const nullableRangeValue = ref(null)

function setNullableRangeValue(newValue: any) {
  nullableRangeValue.value = newValue
}

function resetNullableRange() {
  nullableRangeValue.value = null
}

// CustomizedSlider组件
const customizedValue = ref(50)

function onCustomizedSliderChange(newValue: any) {
  log(newValue)
  customizedValue.value = newValue
}

function onCustomizedSliderAfterChange(newValue: unknown) {
  console.log(newValue) //eslint-disable-line
}

// DynamicBounds组件
const dynamicMin = ref(1)
const dynamicMax = ref(100)
const dynamicStep = ref(10)
const dynamicValue = ref(1)

function onDynamicSliderChange(newValue: any) {
  log(newValue)
  dynamicValue.value = newValue
}

function onDynamicMinChange(e: any) {
  dynamicMin.value = +e.target.value || 0
}

function onDynamicMaxChange(e: any) {
  dynamicMax.value = +e.target.value || 100
}

function onDynamicStepChange(e: any) {
  dynamicStep.value = +e.target.value || 1
}

const labelStyle = { minWidth: '60px', display: 'inline-block' }
const inputStyle = { marginBottom: '10px' }
</script>

<template>
  <div>
    <div :style="style">
      <p>Basic Slider</p>
      <Slider @change="log" />
    </div>
    <div :style="style">
      <p>Basic Slider, `startPoint=50`</p>
      <Slider :start-point="50" @change="log" />
    </div>
    <div :style="style">
      <p>Slider reverse</p>
      <Slider reverse :min="20" :max="60" @change="log" />
    </div>
    <div :style="style">
      <p>Basic Slider，`step=20`</p>
      <Slider :step="20" :default-value="50" @before-change="log" />
    </div>
    <div :style="style">
      <p>Basic Slider，`step=20, dots`</p>
      <Slider dots :step="20" :default-value="100" @change-complete="log" />
    </div>
    <div :style="style">
      <p>
        Basic Slider，`step=20, dots, dotStyle={"borderColor: 'orange'"}, activeDotStyle=
        {"borderColor: 'yellow'"}`
      </p>
      <Slider
        dots
        :step="20"
        :default-value="100"
        :dot-style="{ borderColor: 'orange' }"
        :active-dot-style="{ borderColor: 'yellow' }"
        @change-complete="log"
      />
    </div>
    <div :style="style">
      <p>Slider with tooltip, with custom `tipFormatter`</p>
      <TooltipSlider
        :tip-formatter="percentFormatter"
        :tip-props="{ overlayClassName: 'foo' }"
        @change="log"
      />
    </div>
    <div :style="style">
      <p>
        Slider with custom handle and track style.<strong>(old api, will be deprecated)</strong>
      </p>
      <Slider
        :default-value="30"
        :rail-style="{ backgroundColor: 'red', height: 10 }"
        :track-style="{ backgroundColor: 'blue', height: 10 }"
        :handle-style="{
          borderColor: 'blue',
          height: 28,
          width: 28,
          marginLeft: -14,
          marginTop: -9,
          backgroundColor: 'black',
        }"
      />
    </div>
    <div :style="style">
      <p>
        Slider with custom handle and track style.<strong>(The recommended new api)</strong>
      </p>
      <Slider
        :default-value="30"
        :track-style="{ backgroundColor: 'blue', height: 10 }"
        :handle-style="{
          borderColor: 'blue',
          height: 28,
          width: 28,
          marginLeft: -14,
          marginTop: -9,
          backgroundColor: 'black',
        }"
        :rail-style="{ backgroundColor: 'red', height: 10 }"
      />
    </div>
    <div :style="style">
      <p>
        Reversed Slider with custom handle and track style.
        <strong>(The recommended new api)</strong>
      </p>
      <Slider
        :default-value="30"
        :track-style="{ backgroundColor: 'blue', height: 10 }"
        reverse
        :handle-style="{
          borderColor: 'blue',
          height: 28,
          width: 28,
          marginLeft: -14,
          marginTop: -9,
          backgroundColor: 'black',
        }"
        :rail-style="{ backgroundColor: 'red', height: 10 }"
      />
    </div>
    <div :style="style">
      <p>Basic Slider, disabled</p>
      <Slider disabled @change="log" />
    </div>
    <div :style="style">
      <p>Controlled Slider</p>
      <Slider :value="50" />
    </div>
    <div :style="style">
      <p>Customized Slider</p>
      <Slider
        :value="customizedValue"
        @change="onCustomizedSliderChange"
        @change-complete="onCustomizedSliderAfterChange"
      />
    </div>
    <div :style="style">
      <p>Slider with null value and reset button</p>
      <div>
        <Slider
          :value="nullableSliderValue"
          @change="onNullableSliderChange"
          @change-complete="onNullableSliderAfterChange"
        />
        <button type="button" @click="resetNullableSlider">
          Reset
        </button>
      </div>
    </div>
    <div :style="style">
      <p>Range Slider with null value and reset button</p>
      <div>
        <Slider range :value="nullableRangeValue" @change="setNullableRangeValue" />
        <button type="button" @click="resetNullableRange">
          Reset
        </button>
      </div>
    </div>
    <div :style="style">
      <p>Slider with dynamic `min` `max` `step`</p>
      <div>
        <label :style="labelStyle">Min: </label>
        <input
          type="number"
          :value="dynamicMin"
          :style="inputStyle"
          @input="onDynamicMinChange"
        >
        <br>
        <label :style="labelStyle">Max: </label>
        <input
          type="number"
          :value="dynamicMax"
          :style="inputStyle"
          @input="onDynamicMaxChange"
        >
        <br>
        <label :style="labelStyle">Step: </label>
        <input
          type="number"
          :value="dynamicStep"
          :style="inputStyle"
          @input="onDynamicStepChange"
        >
        <br>
        <br>
        <label :style="labelStyle">Value: </label>
        <span>{{ dynamicValue }}</span>
        <br>
        <br>
        <Slider
          :value="dynamicValue"
          :min="dynamicMin"
          :max="dynamicMax"
          :step="dynamicStep"
          @change="onDynamicSliderChange"
        />
      </div>
    </div>
  </div>
</template>
