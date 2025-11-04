<script setup>
import { computed, reactive } from 'vue'
import { Trigger } from '../_src'
import './assets/index.less'

const state = reactive({
  mask: true,
  maskClosable: true,
  placement: 'bottom',
  trigger: {
    click: true,
  },
  offsetX: undefined,
  offsetY: undefined,
  stretch: 'minWidth',
  arrow: true,
  transitionName: 'vc-trigger-popup-zoom',
})
const getPopupAlign = computed(() => {
  const { offsetX, offsetY } = state
  return {
    offset: [offsetX, offsetY],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  }
})
const builtinPlacements = {
  left: {
    points: ['cr', 'cl'],
    offset: [-10, 0],
  },
  right: {
    points: ['cl', 'cr'],
    offset: [10, 0],
  },
  top: {
    points: ['bc', 'tc'],
    offset: [0, -10],
  },
  bottom: {
    points: ['tc', 'bc'],
    offset: [0, 10],
  },
  topLeft: {
    points: ['bl', 'tl'],
    offset: [0, -10],
  },
  topRight: {
    points: ['br', 'tr'],
    offset: [0, -10],
  },
  bottomRight: {
    points: ['tr', 'br'],
    offset: [0, 10],
  },
  bottomLeft: {
    points: ['tl', 'bl'],
    offset: [0, 10],
  },
}
function preventDefault(e) {
  e.preventDefault()
}
function getPopupContainer(trigger) {
  return trigger.parentNode
}
function onPlacementChange(e) {
  state.placement = e.target.value
}

function onStretch(e) {
  state.stretch = e.target.value
}

function onTransitionChange(e) {
  state.transitionName = e.target.checked ? e.target.value : ''
}

function onTriggerChange(e) {
  const clone = { ...state.trigger }

  if (e.target.checked) {
    clone[e.target.value] = 1
  }
  else {
    delete clone[e.target.value]
  }
  state.trigger = clone
}

function onOffsetXChange(e) {
  const targetValue = e.target.value
  state.offsetX = targetValue || undefined
}

function onOffsetYChange(e) {
  const targetValue = e.target.value
  state.offsetY = targetValue || undefined
}

function onVisibleChange(visible) {
  console.log('tooltip', visible)
}

function onMask(e) {
  state.mask = e.target.checked
}

function onMaskClosable(e) {
  state.maskClosable = e.target.checked
}

function destroy() {
  state.destroyed = true
}

function destroyPopupOnHide(e) {
  state.destroyPopupOnHide = e.target.checked
}

function autoDestroy(e) {
  state.autoDestroy = e.target.checked
}
</script>

<template>
  <div v-if="!state.destroyed">
    <div
      style="margin: 10px 20px;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;"
    >
      <label>
        placement:
        <select :value="state.placement" @change="onPlacementChange">
          <option>right</option>
          <option>left</option>
          <option>top</option>
          <option>bottom</option>
          <option>topLeft</option>
          <option>topRight</option>
          <option>bottomRight</option>
          <option>bottomLeft</option>
        </select>
      </label>

      <label>
        Stretch:
        <select :value="state.stretch" @change="onStretch">
          <option value="">--NONE--</option>
          <option value="width">width</option>
          <option value="minWidth">minWidth</option>
          <option value="height">height</option>
          <option value="minHeight">minHeight</option>
        </select>
      </label>

      <label>
        <input
          value="vc-trigger-popup-zoom"
          type="checkbox"
          :checked="state.transitionName === 'vc-trigger-popup-zoom'"
          @change="onTransitionChange"
        >
        transitionName
      </label>
      <label>
        trigger:
        <label>
          <input
            value="hover"
            :checked="!!state.trigger.hover"
            type="checkbox"
            @change="onTriggerChange"
          >
          hover
        </label>
        <label>
          <input
            value="focus"
            :checked="!!state.trigger.focus"
            type="checkbox"
            @change="onTriggerChange"
          >
          focus
        </label>
        <label>
          <input
            value="click"
            :checked="!!state.trigger.click"
            type="checkbox"
            @change="onTriggerChange"
          >
          click
        </label>
        <label>
          <input
            value="contextMenu"
            :checked="!!state.trigger.contextMenu"
            type="checkbox"
            @change="onTriggerChange"
          >
          contextMenu
        </label>
      </label>

      <label>
        <input
          :checked="!!state.autoDestroy"
          type="checkbox"
          @change="autoDestroy"
        >
        autoDestroy
      </label>

      <label>
        <input
          :checked="!!state.destroyPopupOnHide"
          type="checkbox"
          @change="destroyPopupOnHide"
        >
        destroyPopupOnHide
      </label>

      <label>
        <input
          :checked="!!state.mask"
          type="checkbox"
          @change="onMask"
        >
        mask
      </label>

      <label>
        <input
          :checked="!!state.maskClosable"
          type="checkbox"
          @change="onMaskClosable"
        >
        maskClosable
      </label>

      <label>
        <input
          :checked="state.mobile"
          type="checkbox"
          @hange="() => state.mobile = !state.mobile"
        >
        mobile
      </label>

      <label>
        offsetX:
        <input
          type="text"
          :style="{ width: '50px' }"
          @change="onOffsetXChange"
        >
      </label>

      <label>
        offsetY:
        <input
          type="text"
          :style="{ width: '50px' }"
          @change="onOffsetYChange"
        >
      </label>

      <button type="button" @click="destroy">
        destroy
      </button>
      <label>
        arrow:
        <input type="checkbox" :checked="state.arrow" @change="() => state.arrow = !state.arrow">
      </label>
    </div>
    <div :style="{ margin: '120px', position: 'relative' }">
      <Trigger
        :arrow="state.arrow"
        :get-popup-container="getPopupContainer"
        :popup-align="getPopupAlign"
        :popup-placement="state.placement"
        :destroy-popup-on-hide="state.destroyPopupOnHide"
        :auto-destroy="state.autoDestroy"
        :mask="state.mask"
        :mask-closable="state.maskClosable"
        :stretch="state.stretch"
        mask-animation="fade"
        :action="Object.keys(state.trigger)"
        :builtin-placements="builtinPlacements"
        :popup-style="{
          border: '1px solid red',
          padding: '10px',
          background: 'white',
          boxSizing: 'border-box',
        }"
        :popup-transition-name="state.transitionName"
        @after-open-change="onVisibleChange"
        @click="() => console.log('click-popup')"
      >
        <a
          :style="{ margin: '20px', display: 'inline-block', background: `rgba(255, 0, 0, 0.05)` }"
          @click="preventDefault"
        >
          <p>This is a example of trigger usage.</p>
          <p>You can adjust the value above</p>
          <p>which will also change the behaviour of popup.</p>
        </a>
        <template #popup>
          <div>i am a popup</div>
        </template>
      </Trigger>
    </div>
  </div>
</template>
