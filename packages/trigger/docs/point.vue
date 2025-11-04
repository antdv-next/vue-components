<script setup>
import { ref } from 'vue'
import { Trigger } from '../_src'
import './assets/index.less'

const builtinPlacements = {
  topLeft: {
    points: ['tl', 'tl'],
  },
}
const action = ref('click')
const mouseEnterDelay = ref(0)
</script>

<template>
  <div>
    <label>
      Trigger type: {{ action }}
      <select v-model="action">
        <option>click</option>
        <option>hover</option>
        <option>contextMenu</option>
      </select>
    </label>
    <template v-if="action === 'hover' ">
      <label>
        Mouse enter delay: {{ mouseEnterDelay }}
        <input
          v-model="mouseEnterDelay"
          type="text"
        >
      </label>
    </template>
    <div style="margin: 50px">
      <Trigger
        popup-placement="topLeft"
        :action="action"
        :popup-align="{
          overflow: {
            adjustX: 1,
            adjustY: 1,
          },
        }"
        :mouse-enter-delay="mouseEnterDelay"
        popup-class-name="point-popup"
        :builtin-placements="builtinPlacements"
        align-point
      >
        <div
          style="
            border: 1px solid red;
            padding: 100px 0;
            text-align: center;
          "
        >
          Interactive region
        </div>
        <template #popup>
          <div
            style="
              padding: 20px;
              background: rgba(0, 255, 0, 0.3);
            "
          >
            This is popup
          </div>
        </template>
      </Trigger>
    </div>
  </div>
</template>

<style scoped>
.point-popup {
  pointer-events: none;
}
</style>
