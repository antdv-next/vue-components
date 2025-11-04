<script setup lang="ts">
import { ref } from 'vue'
import { Trigger } from '../_src'
import './assets/index.less'

const open1 = ref(false)
const open2 = ref(false)
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
  background: 'rgba(255, 0, 0, 0.1)',
}
</script>

<template>
  <div style="margin: 200px">
    <div>
      <Trigger
        popup-placement="right"
        :action="['click']"
        :builtin-placements="builtinPlacements"
        :popup-visible="open1"
        fresh
        @open-change="e => open1 = e"
      >
        <span>Click Me</span>
        <template #popup>
          <Trigger
            popup-placement="right"
            :action="['click']"
            :builtin-placements="builtinPlacements"
            :popup-visible="open2"
            fresh
            @open-change="e => open2 = e"
          >
            <div :style="popupBorderStyle">
              i am a click popup
              <button @click="e => { e.stopPropagation(); e.preventDefault() }">
                I am a preventPop
              </button>
            </div>
            <template #popup>
              <div :style="popupBorderStyle">
                i am a click popup
              </div>
            </template>
          </Trigger>
        </template>
      </Trigger>
    </div>
  </div>
</template>

<style scoped>

</style>
