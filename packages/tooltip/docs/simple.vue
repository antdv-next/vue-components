<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { ref } from 'vue'
import Tooltip from '../src'
import { placements } from '../src/placements'
import './assets/bootstrap.less'

interface DestroyTooltipOption {
  name: string
  value: number
}

const placement = ref('right')
const transitionName = ref('vc-tooltip-zoom')
const trigger = ref<Record<string, number>>({
  hover: 1,
  click: 0,
  focus: 0,
})
const offsetX = ref(placements.right.offset[0])
const offsetY = ref(placements.right.offset[1])
const overlayInnerStyle = ref<CSSProperties | undefined>()
const destroyTooltipOnHide = ref(false)

const destroyTooltipOptions: DestroyTooltipOption[] = [
  {
    name: 'don\'t destroy',
    value: 0,
  },
  {
    name: 'destroy parent',
    value: 1,
  },
  {
    name: 'keep parent',
    value: 2,
  },
]

function onPlacementChange(e: Event) {
  const target = e.target as HTMLSelectElement
  const newPlacement = target.value
  const { offset } = placements[newPlacement]
  placement.value = newPlacement
  offsetX.value = offset[0]
  offsetY.value = offset[1]
}

function onTransitionChange(e: Event) {
  const target = e.target as HTMLInputElement
  transitionName.value = target.checked ? target.value : ''
}

function onTriggerChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.checked) {
    trigger.value[target.value] = 1
  }
  else {
    delete trigger.value[target.value]
  }
}

function onOffsetXChange(e: Event) {
  const target = e.target as HTMLInputElement
  offsetX.value = target.value ? Number(target.value) : undefined
}

function onOffsetYChange(e: Event) {
  const target = e.target as HTMLInputElement
  offsetY.value = target.value ? Number(target.value) : undefined
}

function onVisibleChange(visible: boolean) {
  console.log('tooltip', visible)
}

function onDestroyChange(e: Event) {
  const target = e.target as HTMLSelectElement
  const value = Number(target.value)
  destroyTooltipOnHide.value = [false, { keepParent: false }, { keepParent: true }][value] as any
}

function onOverlayInnerStyleChange() {
  overlayInnerStyle.value = overlayInnerStyle.value ? undefined : { background: 'red' }
}

function preventDefault(e: Event) {
  e.preventDefault()
}
</script>

<template>
  <div>
    <div style="margin: 10px 20px">
      <label>
        placement:
        <select :value="placement" @change="onPlacementChange">
          <option v-for="p in Object.keys(placements)" :key="p" :value="p">{{ p }}</option>
        </select>
      </label>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <label>
        <input
          value="rc-tooltip-zoom"
          type="checkbox"
          :checked="transitionName === 'rc-tooltip-zoom'"
          @change="onTransitionChange"
        >
        transitionName
      </label>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <label>
        destroyTooltipOnHide:
        <select @change="onDestroyChange">
          <option
            v-for="{ name, value } in destroyTooltipOptions"
            :key="value"
            :value="value"
          >{{ name }}</option>
        </select>
      </label>
      &nbsp;&nbsp;&nbsp;&nbsp; trigger:
      <label>
        <input
          value="hover"
          :checked="!!trigger.hover"
          type="checkbox"
          @change="onTriggerChange"
        >
        hover
      </label>
      <label>
        <input
          value="focus"
          :checked="!!trigger.focus"
          type="checkbox"
          @change="onTriggerChange"
        >
        focus
      </label>
      <label>
        <input
          value="click"
          :checked="!!trigger.click"
          type="checkbox"
          @change="onTriggerChange"
        >
        click
      </label>
      <br>
      <label>
        offsetX:
        <input
          type="text"
          :value="offsetX"
          style="width: 50px"
          @change="onOffsetXChange"
        >
      </label>
      &nbsp;&nbsp;&nbsp;&nbsp;
      <label>
        offsetY:
        <input
          type="text"
          :value="offsetY"
          style="width: 50px"
          @change="onOffsetYChange"
        >
      </label>
      <label>
        <input
          value="overlayInnerStyle"
          :checked="!!overlayInnerStyle"
          type="checkbox"
          @change="onOverlayInnerStyleChange"
        >
        overlayInnerStyle(red background)
      </label>
    </div>
    <div style="margin: 100px">
      <Tooltip
        :placement="placement"
        :mouse-enter-delay="0"
        :mouse-leave-delay="0.1"
        :destroy-tooltip-on-hide="destroyTooltipOnHide"
        :trigger="Object.keys(trigger)"
        :overlay-inner-style="overlayInnerStyle"
        @visible-change="onVisibleChange"
        @after-visible-change="onVisibleChange"
      >
        <template #overlay>
          <div style="height: 50px; width: 50px">
            i am a tooltip
          </div>
        </template>
        <div style="height: 100px; width: 100px; border: 1px solid red">
          trigger
        </div>
      </Tooltip>
    </div>
  </div>
</template>
