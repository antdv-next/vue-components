<script setup lang="ts">
import Image from '../src'
import { defaultIcons } from './assets/common.tsx'
</script>

<template>
  <Image
    :preview="{ cover: 'preview!', icons: defaultIcons }"
    src="error1"
    fallback="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
    width="200px"
  />
</template>

<style scoped>

</style>
