<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue'
import { Trigger } from '../_src'
import './assets/index.less'

const experimentalConfig = {
  _experimental: {
    dynamicInset: true,
  },
}

const builtinPlacements = {
  top: {
    points: ['bc', 'tc'],
    overflow: {
      shiftX: 0,
      adjustY: true,
    },
    offset: [0, 0],
    ...experimentalConfig,
  },
  topLeft: {
    points: ['bl', 'tl'],
    overflow: {
      adjustX: true,
      adjustY: false,
      shiftY: true,
    },
    offset: [0, -20],
    ...experimentalConfig,
  },
  topRight: {
    points: ['br', 'tr'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
    offset: [0, 0],
    ...experimentalConfig,
  },
  left: {
    points: ['cr', 'cl'],
    overflow: {
      adjustX: true,
      shiftY: true,
    },
    offset: [0, 0],
    ...experimentalConfig,
  },
  leftTop: {
    points: ['tr', 'tl'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
    offset: [0, 0],
    ...experimentalConfig,
  },
  leftBottom: {
    points: ['br', 'bl'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
    offset: [0, 0],
    ...experimentalConfig,
  },
  right: {
    points: ['cl', 'cr'],
    overflow: {
      adjustX: true,
      shiftY: true,
    },
    offset: [0, 0],
    ...experimentalConfig,
  },
  bottom: {
    points: ['tc', 'bc'],
    overflow: {
      shiftX: 50,
      adjustY: true,
    },
    offset: [0, 0],
    ...experimentalConfig,
  },
  bottomLeft: {
    points: ['tl', 'bl'],
    overflow: {
      shiftX: 50,
      adjustY: true,
      shiftY: true,
    },
    offset: [0, 20],
    ...experimentalConfig,
  },
}

const popupPlacement = 'bottomLeft'
const popupHeight = ref(60)
const containerRef = useTemplateRef('containerRef')
onMounted(() => {
  containerRef.value!.scrollLeft = document.defaultView!.innerWidth
  containerRef.value!.scrollTop = document.defaultView!.innerHeight
})
defineExpose({
  builtinPlacements,
})
</script>

<template>
  <div style="position: fixed; top: 0; left: 0">
    <button
      @click="() => popupHeight = popupHeight === 60 ? 200 : 60"
    >
      Popup Height: {{ popupHeight }}
    </button>
  </div>
  <div
    ref="containerRef"
    style="
      position: absolute;
      inset: 64px;
      overflow: auto;
      border: 1px solid red;
    "
  >
    <div
      style="
        width: 300vw;
        height: 450vh;
        background: rgba(0, 0, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
      "
    >
      <Trigger
        arrow
        popup-visible
        :get-popup-container="(triggerNode) => triggerNode?.parentNode as any"
        :popup-placement="popupPlacement"
        :builtin-placements="builtinPlacements"
      >
        <span
          style="
            display: inline-block;
            background: green;
            color: #FFF;
            padding-block: 30px;
            padding-inline: 70px;
            opacity: 0.9;
            transform: scale(0.6);
          "
        >
          Target
        </span>
        <template #popup>
          <div
            :style="{
              background: 'yellow',
              border: '1px solid blue',
              width: '200px',
              height: `${popupHeight}px`,
              opacity: 0.9,
            }"
          >
            Popup
          </div>
        </template>
      </Trigger>
    </div>
  </div>
</template>

<style scoped>

</style>
