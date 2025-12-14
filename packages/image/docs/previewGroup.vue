<script setup lang="ts">
import Image from '../src'
import jpg1 from './assets/1.jpeg'
import jpg2 from './assets/2.jpeg'
import jpg3 from './assets/3.jpeg'
import { defaultIcons } from './assets/common.tsx'
import disabled from './assets/disabled.jpeg'
const PreviewGroup = Image.PreviewGroup
</script>

<template>
  <PreviewGroup
    :icons="defaultIcons"
    @change="(current, prev) => console.log(`当前第${current}张，上一次第${prev === undefined ? '-' : prev}张`)"
  >
    <template #countRender="current, total">
      <span>第{{ current }}张，总共{{ total }}张</span>
    </template>
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
