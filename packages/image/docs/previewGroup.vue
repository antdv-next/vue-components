<script setup lang="ts">
import Image from '../src'
import PreviewGroup from '../src/PreviewGroup.tsx'
import jpg1 from './assets/1.jpeg'
import jpg2 from './assets/2.jpeg'
import jpg3 from './assets/3.jpeg'
import disabled from './assets/disabled.jpeg'
import { defaultIcons } from './assets/common.tsx'
</script>

<template>
  <PreviewGroup
    :icons="defaultIcons"
    :preview="{
      countRender: (current, total) => `第${current}张 / 总共${total}张`,
    }"
    @change="(current, prev) => console.log(`当前第${current}张，上一次第${prev === undefined ? '-' : prev}张`)"
  >
    <Image
      style="margin-right: 24px; width: 200px"
      :src="jpg1"
    />
    <Image
      style="margin-right: 24px; width: 200px"
      :preview="false"
      :src="disabled"
    />
    <Image
      style="margin-right: 24px; width: 200px"
      :src="jpg2"
    />
    <Image
      style="margin-right: 24px; width: 200px"
      :src="jpg3"
    />
    <Image style="margin-right: 24px; width: 200px" src="error" alt="error" />
    <Image
      style="margin-right: 24px; width: 200px"
      :src="jpg1"
    />
  </PreviewGroup>
</template>

<style scoped>

</style>
