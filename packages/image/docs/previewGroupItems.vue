<script setup lang="ts">
import Image from '../src'
import PreviewGroup from '../src/PreviewGroup.tsx'
</script>

<template>
  <PreviewGroup
    :items="[
      'https://gw.alipayobjects.com/zos/antfincdn/aPkFc8Sj7n/method-draw-image.svg',
      'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg',
      'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
    ]"
  >
    <Image
      width="200px"
      src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
    />
  </PreviewGroup>
</template>

<style scoped>

</style>
