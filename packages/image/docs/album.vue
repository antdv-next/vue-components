<script setup lang="ts">
import Image from '../src'
import PreviewGroup from '../src/PreviewGroup.tsx'
import jpg1 from './assets/1.jpeg'
import jpg2 from './assets/2.jpeg'
import jpg3 from './assets/3.jpeg'
import { defaultIcons } from './assets/common.tsx'

const imgs = [jpg1, jpg2, jpg3]
</script>

<template>
  <div>
    <PreviewGroup
      :icons="defaultIcons"
      :items="imgs"
    >
      <Image :src="jpg1" />
    </PreviewGroup>
  </div>
</template>

<style scoped>

</style>
