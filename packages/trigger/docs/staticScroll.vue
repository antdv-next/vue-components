<script setup lang="ts">
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
</script>

<template>
  <div
    style="
      background: rgba(0, 0, 255, 0.1);
      margin: 64px;
      height: 200px;
      overflow: auto;
      position: static;
    "
  >
    <Trigger
      arrow
      :popup-style="{ boxShadow: '0 0 5px red' }"
      popup-visible
      :builtin-placements="builtinPlacements"
      popup-placement="top"
      stretch="minWidth"
      :get-popup-container="(e) => e.parentElement!"
    >
      <span
        style="
          background: green;
          color: #FFF;
          padding-block: 30px;
          padding-inline: 70px;
          opacity: 0.9;
          transform: scale(0.6);
          display: inline-block;
        "
      >
        Target
      </span>
      <template #popup>
        <div
          style="
            background: yellow;
            border: 1px solid blue;
            width: 200px;
            height: 60px;
            opacity: 0.9;
          "
        >
          Popup
        </div>
      </template>
    </Trigger>
    <h1 v-for="(item, index) in Array(20).fill(null)" :key="index" :style="{ width: '200vw' }">
      Placeholder Line {{ index }}
    </h1>
  </div>
</template>

<style scoped>

</style>
