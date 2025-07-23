<script setup lang="ts">
import { ref } from 'vue'
import Image from '../src'
import PreviewGroup from '../src/PreviewGroup.tsx'
import jpg1 from './assets/1.jpeg'
import jpg2 from './assets/2.jpeg'
import { defaultIcons } from './assets/common.tsx'

const open = ref(false)
const current = ref(1)
</script>

<template>
  <div>
    <div>
      <button
        type="button"
        @click="() => {
          open = true
        }"
      >
        Switch Preview
      </button>
    </div>
    <PreviewGroup
      :preview="{
        icons: defaultIcons,
        open,
        onOpenChange: value => {
          console.log('open change', value)
          open = value
        },
        current,
      }"
      @change="c => current = c"
    >
      <Image
        src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
        width="200px"
      />
      <Image
        style="margin-right: 24px; width: 200px;"
        :src="jpg1"
      />
      <Image
        style="margin-right: 24px; width: 200px;"
        :src="jpg2"
      />
    </PreviewGroup>
  </div>
</template>

<style scoped>

</style>
