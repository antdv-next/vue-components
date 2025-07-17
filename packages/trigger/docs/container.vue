<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from 'vue'
import { Trigger } from '../src'
import './assets/index.less'

const builtinPlacements = {
  topLeft: {
    points: ['bl', 'tl'],
    overflow: {
      shiftX: 50,
      adjustY: true,
    },
    offset: [0, 0],
    targetOffset: [10, 0],
  },
  bottomLeft: {
    points: ['tl', 'bl'],
    overflow: {
      adjustX: true,
      adjustY: true,
    },
  },
  top: {
    points: ['bc', 'tc'],
    overflow: {
      shiftX: 50,
      adjustY: true,
    },
    offset: [0, -10],
  },
  bottom: {
    points: ['tc', 'bc'],
    overflow: {
      shiftX: true,
      adjustY: true,
    },
    offset: [0, 10],
    htmlRegion: 'scroll' as const,
  },
  left: {
    points: ['cr', 'cl'],
    overflow: {
      adjustX: true,
      shiftY: true,
    },
    offset: [-10, 0],
  },
  right: {
    points: ['cl', 'cr'],
    overflow: {
      adjustX: true,
      shiftY: 24,
    },
    offset: [10, 0],
  },
}

const popupPlacement = 'top'
const visible = ref(false)
const scale = ref(1)
const targetVisible = ref(true)
const rootRef = ref<HTMLDivElement>()
const popHolderRef = ref<HTMLDivElement>()
const scrollRef = useTemplateRef<HTMLDivElement>('scrollRef')
onMounted(() => {
  const ih = window.innerHeight
  scrollRef.value!.scrollLeft = ih
  scrollRef.value!.scrollTop = ih / 2
})
</script>

<template>
  <div
    id="demo-root"
    ref="rootRef"
    style="background: rgba(0, 0, 255, 0.1); padding: 16px"
  >
    <div
      style="
        position: fixed;
        left: 0;
        top: 0;
        z-index: 9999;
      "
    >
      <input
        type="number"
        :value="scale"
        @change="e => scale = e.target.value"
      >
      <button
        type="button"
        @click="() => targetVisible = !targetVisible"
      >
        Target Visible: {{ visible }}
      </button>
      <button
        @click="() => visible = true"
      >
        Trigger Visible
      </button>
    </div>
    <div
      id="demo-holder"
      ref="popHolderRef"
      :style="{
        position: 'relative',
        width: 0,
        height: 0,
        zIndex: 999,
        // Transform
        transform: `scale(${scale})`,
        transformOrigin: 'top left',
      }"
    />
    <div
      ref="scrollRef"
      style="
        border: 1px solid red;
        padding: 10px;
        height: 100%;
        background: #FFF;
        position: relative;
        overflow: auto;
      "
    >
      <div
        style="
          height: 100vh;
          padding-top: 30vh;
          width: calc(300vw);
          display: flex;
          justify-content: center;
          align-items: start;
        "
      >
        <Trigger
          :arrow="{ content: 'Arrow' }"
          action="click"
          popup-transition-name="vc-trigger-popup-zoom"
          :popup-style="{ boxShadow: '0 0 5px red' }"
          :popup-visible="visible"
          :get-popup-container="() => popHolderRef"
          :popup-placement="popupPlacement"
          :builtin-placements="builtinPlacements"
          stretch="minWidth"
          @open-change="(nextVisible) => {
            visible = nextVisible;
          }"
          @popup-align="(domNode, align) => {
            console.log('onPopupAlign:', domNode, align);
          }"
        >
          <span
            :style="{
              background: 'green',
              color: '#FFF',
              paddingBlock: '30px',
              paddingInline: '70px',
              opacity: '0.9',
              transform: 'scale(0.6)',
              display: targetVisible ? 'inline-block' : 'none',
            }"
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
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
