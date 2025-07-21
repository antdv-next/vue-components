<script setup lang="ts">
import Image from '../src'
import { defaultIcons } from './assets/common.tsx'
</script>

<template>
  <div>
    <Image
      src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
      width="200px"
      style="margin-right: 24px"
      :preview="{
        icons: defaultIcons,
        onOpenChange: (open) => {
          console.log('open', open);
        },
        zIndex: 9999,
      }"
      @click="() => {
        console.log('click');
      }"
    />

    <Image
      src="https://gw.alipayobjects.com/mdn/rms_08e378/afts/img/A*P0S-QIRUbsUAAAAAAAAAAABkARQnAQ"
      width="200px"
      style="margin-right: 24px"
      :preview="{ icons: defaultIcons, cover: 'Click to Preview' }"
    />
    <Image
      src="https://gw.alipayobjects.com/mdn/rms_08e378/afts/img/A*ngiJQaLQELEAAAAAAAAAAABkARQnAQ"
      width="200px"
      style="margin-right: 24px"
      :preview="{ icons: defaultIcons }"
    />
    <Image
      src="https://gw.alipayobjects.com/mdn/rms_08e378/afts/img/A*NZuwQp_vcIQAAAAAAAAAAABkARQnAQ"
      width="200px"
      :preview="{ icons: defaultIcons }"
    />

    <Image
      src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
      width="200px"
      height="100px"
      :preview="{ icons: defaultIcons }"
    />
  </div>
</template>

<style scoped>

</style>
