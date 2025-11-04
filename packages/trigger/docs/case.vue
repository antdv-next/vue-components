<script setup>
import { reactive } from 'vue'
import { Trigger } from '../_src'
import './case.less'

const builtinPlacements = {
  left: {
    points: ['cr', 'cl'],
  },
  right: {
    points: ['cl', 'cr'],
  },
  top: {
    points: ['bc', 'tc'],
  },
  bottom: {
    points: ['tc', 'bc'],
  },
  topLeft: {
    points: ['bl', 'tl'],
  },
  topRight: {
    points: ['br', 'tr'],
  },
  bottomRight: {
    points: ['tr', 'br'],
  },
  bottomLeft: {
    points: ['tl', 'bl'],
  },
}

const Motion = {
  name: 'case-motion',
}

const MaskMotion = {
  name: 'mask-motion',
}

const state = reactive({
  mask: true,
  maskClosable: true,
  placement: 'right',
  trigger: {
    click: true,
  },
  offsetX: 0,
  offsetY: 0,
  stretch: 'minWidth',
  arrow: true,
  transitionName: 'vc-trigger-popup-zoom',
  forceRender: false,
  motion: true,
})
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
  console.log('offsetY', targetValue)
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
function onForceRender(e) {
  state.forceRender = e.target.checked
}
</script>

<template>
  <div>
    <div :style="{ margin: '10px 20px' }">
      <strong>Actions: </strong>
      <label>
        <input type="checkbox" value="hover" :checked="!!state.trigger.hover" @change="onTriggerChange">
        Hover
      </label>
      <label>
        <input type="checkbox" value="focus" :checked="!!state.trigger.focus" @change="onTriggerChange">
        Focus
      </label>
      <label>
        <input type="checkbox" value="click" :checked="!!state.trigger.click" @change="onTriggerChange">
        Click
      </label>
      <label>
        <input type="checkbox" value="contextMenu" :checked="!!state.trigger.contextMenu" @change="onTriggerChange">
        ContextMenu
      </label>

      <hr>

      <label>
        Stretch
        <select :value="state.stretch" @change="onStretch">
          <option value="">
            --NONE--
          </option>
          <option value="width">
            width
          </option>
          <option value="minWidth">
            minWidth
          </option>
          <option value="height">
            height
          </option>
          <option value="minHeight">
            minHeight
          </option>
        </select>
      </label>

      <label>
        Placement
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
        Motion
        <input type="checkbox" :checked="!!state.motion" @change="e => state.motion = e.target.checked">
      </label>

      <label>
        Destroy Popup On Hide
        <input type="checkbox" :checked="!!state.destroyPopupOnHide" @change="destroyPopupOnHide">
      </label>

      <label>
        Mask
        <input type="checkbox" :checked="!!state.mask" @change="onMask">
      </label>

      <label>
        Mask Closable
        <input type="checkbox" :checked="!!state.maskClosable" @change="onMaskClosable">
      </label>

      <label>
        Force Render
        <input type="checkbox" :checked="!!state.forceRender" @change="onForceRender">
      </label>

      <label>
        OffsetX
        <input :value="state.offsetX" @change="onOffsetXChange">
      </label>

      <label>
        OffsetY
        <input :value="state.offsetY" @change="onOffsetYChange">
      </label>
    </div>

    <div :style="{ margin: '120px', position: 'relative' }">
      <Trigger
        :popup-align="{
          offset: [state.offsetX, state.offsetY],
          overflow: {
            adjustX: 1,
            adjustY: 1,
          },
        }"
        :popup-placement="state.placement"
        :destroy-popup-on-hide="state.destroyPopupOnHide"
        :mask="state.mask"
        :mask-motion="state.motion ? MaskMotion : null"
        :mask-closable="state.maskClosable"
        :stretch="state.stretch"
        :action="Object.keys(state.trigger)"
        :builtin-placements="builtinPlacements"
        :force-render="state.forceRender"
        :popup-style="{
          border: '1px solid red',
          padding: '10px',
          background: 'white',
          boxSizing: 'border-box',
        }"
        popup="i am a popup"
        :popup-motion="state.motion ? Motion : null"
        @popup-align="() => {
          console.log('Aligned!');
        }"
      >
        <div
          :style="{
            margin: 20,
            display: 'inline-block',
            background: 'rgba(255, 0, 0, 0.05)',
          }"
          tabIndex="0"
          role="button"
        >
          <p>This is a example of trigger usage.</p>
          <p>You can adjust the value above</p>
          <p>which will also change the behaviour of popup.</p>
        </div>
      </Trigger>
    </div>
  </div>
</template>
