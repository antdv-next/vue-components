<script setup lang="ts">
import type { CSSProperties, VNode } from 'vue'
import Slider from '@v-c/slider'
import { h, ref } from 'vue'

const style: CSSProperties = {
  width: '400px',
  margin: '50px',
}

function NodeWrapper(props: any): VNode {
  return h('div', {}, [
    h('slot', {}, { default: () => props.node }),
    h('div', {}, 'TOOLTIP'),
  ])
}
function activeHandleRender(props: any) {
  return h(NodeWrapper, { ...props })
}
const state = ref([0, 50, 80])
</script>

<template>
  <div>
    <div :style="style">
      <Slider
        v-model:value="state"
        range
        :min="0"
        :max="100"
        :styles="{
          tracks: {
            background: `linear-gradient(to right, blue, red)`,
          },
          track: {
            background: 'transparent',
          },
        }"
        :active-handle-render="activeHandleRender"
        @change="(nextValue) => {
          console.log('>>>', nextValue)
        }"
      />
    </div>
  </div>
</template>

<style scoped>

</style>
