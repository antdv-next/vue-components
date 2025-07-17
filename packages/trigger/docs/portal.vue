<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Trigger } from '../src'
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
  background: 'rgba(255, 0, 0, 0.1)',
}
const buttonRef = ref()
onMounted(() => {
  const button = buttonRef.value
  if (button) {
    button.addEventListener('mousedown', (e: MouseEvent) => {
      console.log('button natives down')
      e.stopPropagation()
      e.preventDefault()
    })
  }
})
</script>

<template>
  <div
    style="
      padding: 100px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 100px;
    "
  >
    <Trigger
      popup-placement="right"
      :action="['click']"
      :builtin-placements="builtinPlacements"
      @open-change="(visible) => {
        console.log('visible change:', visible);
      }"
    >
      <button>Click Me</button>

      <template #popup>
        <div :style="popupBorderStyle">
          i am a click popup
          <Teleport to="body">
            <div
              :style="popupBorderStyle"
              @mousedown="(e) => {
                console.log('Portal Down', e);
                e.stopPropagation();
                e.preventDefault();
              }"
            >
              i am a portal element
            </div>
          </Teleport>
        </div>
      </template>
    </Trigger>

    <button
      @mousedown="(e) => {
        console.log('button down');
        e.stopPropagation();
        e.preventDefault();
      }"
    >
      Stop Pop & Prevent Default
    </button>
    <button ref="buttonRef">
      Native Stop Pop & Prevent Default
    </button>
  </div>
</template>

<style scoped>

</style>
