<script setup lang="ts">
import type { CSSProperties, VNode } from 'vue'
import Slider from '@v-c/slider'
import { h, ref } from 'vue'

const style: CSSProperties = {
  width: '400px',
  margin: '50px',
}

// const NodeWrapper = ({ children }: { children: React.ReactElement }) => {
//   return <div>{React.cloneElement(children, {}, <div>TOOLTIP</div>)}</div>;
// };

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
        range
        :min="0"
        :max="100"
        :value="state"
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
