<script setup lang="ts">
import type { Placement } from '../src/Drawer'
import { ref } from 'vue'
import Drawer from '../src'

const placement = ref<Placement>('right')
const childShow = ref(true)
const width = ref('20vw')
const height = ref<string | null>(null)

function onChange(value: string) {
  placement.value = value as Placement
  width.value = value === 'right' || value === 'left' ? '20vw' : null
  height.value = value === 'right' || value === 'left' ? null : '20vh'
  childShow.value = false // 删除子级，删除切换时的过渡动画
  setTimeout(() => {
    childShow.value = true
  })
}
</script>

<template>
  <div>
    <Drawer
      v-if="childShow"
      :placement="placement"
      :width="width"
      :height="height"
    >
      <div class="content">
        Content Area
      </div>
    </Drawer>
    <div
      style="
        width: 100%;
        height: 667px;
        background: #fff000;
        color: #fff;
        text-align: center;
        line-height: 667px;
      "
    >
      选择位置：
      <select
        style="width: 120px; margin-left: 20px"
        :value="placement"
        @change="(e) => onChange(e.target.value)"
      >
        <option value="left">
          左边 left
        </option>
        <option value="top">
          上面 top
        </option>
        <option value="right">
          右边 right
        </option>
        <option value="bottom">
          下面 bottom
        </option>
      </select>
    </div>
  </div>
</template>

<style scoped>
.content {
  padding: 20px;
}
</style>
