<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { Trigger } from '../_src'
import './assets/index.less'

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

const popupBorderStyle = {
  border: '1px solid red',
  padding: '10px',
}
const containerRef = useTemplateRef('containerRef')
const outerDivRef = useTemplateRef('outerDivRef')
</script>

<template>
  <div style="margin: 200px">
    <div>
      <Trigger
        popup-placement="left"
        :action="['click']"
        :builtin-placements="builtinPlacements"
      >
        <span>
          <Trigger
            popup-placement="bottom"
            :action="['hover']"
            :builtin-placements="builtinPlacements"
          >
            <span style=" margin: 20px">trigger</span>
            <template #popup>
              <div :style="popupBorderStyle">i am a hover popup</div>
            </template>
          </Trigger>
        </span>
        <template #popup>
          <div :style="popupBorderStyle">
            i am a click popup
            <Teleport to="body">
              <div>
                I am outer content
                <button
                  @mousedown="(e) => {
                    e.stopPropagation();
                  }"
                >
                  Stop Pop
                </button>
              </div>
            </Teleport>
          </div>
        </template>
      </Trigger>
    </div>
    <div style="margin: 50px">
      <Trigger
        popup-placement="right"
        :action="['hover']"
        :builtin-placements="builtinPlacements"
      >
        <span style="margin: 20px">trigger</span>
        <template #popup>
          <div>
            <div ref="containerRef" />
            <div :style="popupBorderStyle">
              <Trigger
                popup-placement="bottom"
                :action="['click']"
                :builtin-placements="builtinPlacements"
                :get-popup-container="() => containerRef"
              >
                <span style="margin: 20px">clickToShowInnerTrigger</span>
                <template #popup>
                  <div :style="popupBorderStyle">
                    I am inner Trigger Popup
                  </div>
                </template>
              </Trigger>
            </div>
          </div>
        </template>
      </Trigger>
    </div>

    <div
      ref="outerDivRef"
      style="
      position: fixed;
      right: 0;
      bottom: 0;
      width: 200px;
      height: 200px;
      background: red;
    "
    />
  </div>
</template>

<style scoped>

</style>
