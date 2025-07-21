<script setup lang="ts">
import Image from '../src'
import { defaultIcons } from './assets/common.tsx'
</script>

<template>
  <Image
    src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png?x-oss-process=image/auto-orient,1/resize,p_10/quality,q_10"
    :preview="{
      icons: defaultIcons,
      src: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    }"
    width="200px"
  />
</template>

<style scoped>

</style>
