<script setup lang="ts">
import { ref } from 'vue'
import { Trigger } from '../_src'
import './assets/index.less'

const scale = ref(1)
const builtinPlacements = {
  top: {
    points: ['bc', 'tc'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
    offset: [0, 0],
  },
  bottom: {
    points: ['tc', 'bc'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
    offset: [0, 0],
  },
}

const popupPlacement = 'top'
</script>

<template>
  <div>
    <div style="position: fixed; top: 0; right: 0;">
      <input
        type="number"
        :value="scale"
        @change="e => scale = e.target.value"
      >
    </div>

    <div
      style="
      height: 500px;
      width: 500px;
      box-sizing: border-box;
      background: rgba(255,0,0,0.1);
      border: 50px solid rgba(0,0,255,0.1);
      overflow: clip;
      overflow-clip-margin: 50px;
      position: relative;"
    >
      <Trigger
        arrow
        action="click"
        popup-visible
        :popup-style="{ boxShadow: '0 0 5px red' }"
        :popup-placement="popupPlacement"
        :builtin-placements="builtinPlacements"
        stretch="minWidth"
      >
        <span
          style="
          background: green;
          color: #FFF;
          opacity: 0.9;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100px;
          height: 100px;
          position: absolute;
          left: 0;
          top: 80px;"
        >
          Target
        </span>
        <template #popup>
          <div
            style="
              background: yellow;
              border: 1px solid blue;
              width: 100px;
              height: 100px;
              opacity: 0.9;
              box-sizing: border-box;"
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
