<script setup lang="ts">
import { ref } from 'vue'
import Textarea from '../src'

const data = ref('hello\nworld')
function onChange(e: Event) {
  console.log('show-count-change', (e.target as HTMLInputElement).value)
}
const format1 = ref('👨‍👨‍👧')
const format2 = ref('🔥')
</script>

<template>
  <div>
    <p>Uncontrolled</p>
    <Textarea auto-size show-count />
    <p>controlled</p>
    <Textarea v-model:value="data" show-count :max-length="100" @change="onChange" />
    <p>with height</p>
    <Textarea
      v-model:value="data"
      show-count
      style="height: 200px; width: 100%; resize: vertical;"
      @change="onChange"
    />
    <hr>
    <p>Count.exceedFormatter</p>
    <Textarea
      v-model:value="format1"
      :count="{
        show: true,
        max: 5,
      }"
    />
    <Textarea
      v-model:value="format2"
      :count="{
        show: true,
        max: 5,
        exceedFormatter: (val: any, { max }: any) => {
          const segments = [...new Intl.Segmenter().segment(val)];

          return segments
            .filter((seg) => seg.index + seg.segment.length <= max)
            .map((seg) => seg.segment)
            .join('');
        },
      }"
    />
  </div>
</template>

<style scoped>

</style>
