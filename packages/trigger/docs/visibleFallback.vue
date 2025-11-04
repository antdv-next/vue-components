<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Trigger } from '../_src'
import './assets/index.less'

const builtinPlacements = {
  top: {
    points: ['bc', 'tc'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
    offset: [0, 0],
    htmlRegion: 'visibleFirst',
  },
  bottom: {
    points: ['tc', 'bc'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
    offset: [0, 0],
    htmlRegion: 'visibleFirst',
  },
}
const enoughTop = ref(true)
const triggerRef = ref()
const dynamicTop = computed(() => enoughTop.value ? '200px' : '90px')
onMounted(() => {
  if (enoughTop.value) {
    triggerRef.value!.forceAlign()
  }
})
</script>

<template>
  <p>`visibleFirst` should not show in hidden region if still scrollable</p>

  <label>
    <input
      v-model="enoughTop"
      type="checkbox"
    >
    Enough Top (Placement: bottom){{ `${enoughTop}:${dynamicTop}` }}
  </label>

  <div
    style="
      position: absolute;
      left: 50%;
      top: calc(100vh - 100px - 90px - 50px);
      transform: translateX(-50%);
      box-shadow: 0 0 1px blue;
      overflow: hidden;
      width: 500px;
      height: 1000px;
    "
  >
    <Trigger
      ref="triggerRef"
      arrow
      action="click"
      popup-visible
      :get-popup-container="(n) => n?.parentNode as any"
      :popup-style="{ boxShadow: '0 0 5px red' }"
      :popup-placement="enoughTop ? 'bottom' : 'top'"
      :builtin-placements="builtinPlacements"
      stretch="minWidth"
    >
      <span class="target">
        Target
      </span>
      <template #popup>
        <div
          style="
            background: yellow;
            border: 1px solid blue;
            width: 300px;
            height: 100px;
            opacity: 0.9;
            box-Sizing: border-box;
          "
        >
          Should Always place bottom
        </div>
      </template>
    </Trigger>
  </div>
</template>

<style scoped>
.target {
  background: green;
  color: #FFF;
  opacity: 0.9;
  display: flex;
  align-items: center;
  justify-content: center;
  width:100px;
  height: 100px;
  position: absolute;
  left: 50%;
  top: v-bind('dynamicTop');
  transform: translateX(-50%);
}
</style>
