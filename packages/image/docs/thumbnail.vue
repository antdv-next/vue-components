<script setup lang="ts">
import Image from '../src'
import PreviewGroup from '../src/PreviewGroup.tsx'
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
  <br>
  <PreviewGroup :preview="{ icons: defaultIcons }">
    <Image
      key="1"
      src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png?x-oss-process=image/auto-orient,1/resize,p_10/quality,q_10"
      :preview="{
        src: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
      }"
      width="200px"
    />
    <Image
      key="2"
      src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png?x-oss-process=image/auto-orient,1/resize,p_10/quality,q_10/contrast,-100"
      :preview="{
        src: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png?x-oss-process=image/auto-orient,1/contrast,-100',
      }"
      width="200px"
    />
  </PreviewGroup>
</template>

<style scoped>

</style>
