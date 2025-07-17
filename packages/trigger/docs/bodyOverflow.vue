<script setup lang="ts">
import Portal from '@v-c/portal'
import { defineComponent, h, ref } from 'vue'
import { Trigger } from '../src'
import './assets/index.less'

const open = ref(false)
const open1 = ref(false)
const open2 = ref(false)
const open3 = ref(false)

const PortalDemo = defineComponent({
  props: ['open'],
  render() {
    return h(Portal, {
      to: 'body',
      open: open.value,
    }, {
      default: () => h('div', { style: { position: 'fixed', top: '0px', right: '0px', background: 'red', zIndex: 999 }, innerText: 'PortalNode' }),
    })
  },
})
const commonStyle = {
  paddingBlock: '30px',
  paddingInline: '70px',
  opacity: 0.9,
  transform: 'scale(0.6)',
  display: 'inline-block',
}
const commonPopupStyle = {
  background: 'yellow',
  border: '1px solid blue',
  width: '200px',
  height: '60px',
  opacity: 0.9,
}
const popupStyle = { boxShadow: '0 0 5px red' }
function handleClickChange(num: number) {
  if (num === 1) {
    open.value = false
  }
  else if (num === 2) {
    open1.value = false
  }
}
</script>

<template>
  <div>
    <Trigger
      v-model:popup-visible="open"
      arrow
      :popup-style="popupStyle"
      :popup-align="{
        points: ['tc', 'bc'],
        overflow: {
          shiftX: 50,
          adjustY: true,
        },
        htmlRegion: 'scroll',
      }"
      popup-transition-name="vc-trigger-popup-zoom"
      @open-change="next => open = next"
    >
      <button
        :style="commonStyle"
      >
        Target Hover
      </button>

      <template #popup>
        <div
          :style="commonPopupStyle"
        >
          <button @click="handleClickChange(1)">
            close
          </button>

          <PortalDemo />
        </div>
      </template>
    </Trigger>
    <Trigger
      v-model:popup-visible="open1"
      arrow
      action="click"
      popup-transition-name="vc-trigger-popup-zoom"
      :popup-style="popupStyle"
      :popup-align="{
        points: ['tc', 'bc'],
        overflow: {
          shiftX: 50,
          adjustY: true,
        },
        htmlRegion: 'scroll',
      }"
      @open-change="(next) => open1 = next"
    >
      <span
        :style="{
          background: 'green',
          color: '#FFF',
          ...commonStyle,
        }"
      >
        Target Click
      </span>
      <template #popup>
        <div
          :style="commonPopupStyle"
        >
          <button @click="handleClickChange(2)">
            Close
          </button>
        </div>
      </template>
    </Trigger>
    <Trigger
      arrow
      action="contextMenu"
      :popup-visible="open2"
      popup-transition-name="vc-trigger-popup-zoom"
      :popup-style="popupStyle"
      :popup-align="{
        points: ['tc', 'bc'],
        overflow: {
          shiftX: 50,
          adjustY: true,
        },
        htmlRegion: 'scroll',
      }"
      @open-change="(next) => open2 = next"
    >
      <span
        :style="{
          background: 'blue',
          color: '#FFF',
          ...commonStyle,
        }"
      >
        Target ContextMenu1
      </span>
      <template #popup>
        <div
          :style="commonPopupStyle"
        >
          Target ContextMenu1
        </div>
      </template>
    </Trigger>

    <Trigger
      arrow
      action="contextMenu"
      :popup-visible="open3"
      popup-transition-name="vc-trigger-popup-zoom"
      :popup-style="popupStyle"
      :popup-align="{
        points: ['tc', 'bc'],
        overflow: {
          shiftX: 50,
          adjustY: true,
        },
        htmlRegion: 'scroll',
      }"
      @open-change="(next) => open3 = next"
    >
      <span
        :style="{
          background: 'blue',
          color: '#FFF',
          ...commonStyle,
        }"
      >
        Target ContextMenu2
      </span>
      <template #popup>
        <div
          :style="commonPopupStyle"
        >
          Target ContextMenu2
        </div>
      </template>
    </Trigger>
  </div>
</template>

<style scoped>

</style>
