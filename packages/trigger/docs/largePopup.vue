<script setup lang="ts">
import { onMounted, useTemplateRef } from 'vue'
import { Trigger } from '../_src'
import './assets/index.less'

const builtinPlacements = {
  top: {
    points: ['bc', 'tc'],
    overflow: {
      shiftY: true,
      adjustY: true,
    },
    offset: [0, -10],
  },
  bottom: {
    points: ['tc', 'bc'],
    overflow: {
      shiftY: true,
      adjustY: true,
    },
    offset: [0, 10],
    htmlRegion: 'scroll' as const,
  },
}

const containerRef = useTemplateRef('containerRef')

onMounted(() => {
  console.log(builtinPlacements)
  containerRef.value!.scrollTop = document.defaultView!.innerWidth * 0.75
})
</script>

<template>
  <div
    id="demo-root"
    style="background: rgba(0, 0, 255, 0.1); padding: 16px"
  >
    <div
      ref="containerRef"
      style="
        border: 1px solid red;
        padding: 10px;
        height: 100vh;
        background: #FFF;
        position: relative;
        overflow: auto;
      "
    >
      <div
        style="
          height: 200vh;
          padding-top: 100vh;
          display: flex;
          justify-content: center;
          align-items: start;
        "
      >
        <Trigger
          arrow
          action="click"
          :popup-style="{ boxShadow: '0 0 5px red' }"
          popup-visible
          popup-placement="top"
          :builtin-placements="builtinPlacements"
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
                height: 75vh;
                opacity: 0.9;
              "
            >
              Popup 75vh
            </div>
          </template>
        </Trigger>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
