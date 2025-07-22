<script setup lang="ts">
import Image from '../src'
import { defaultIcons } from './assets/common.tsx'
</script>

<template>
  <div>
    <Image
      src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
      width="200px"
      :preview="{
        icons: defaultIcons,
        actionsRender: () => null,
      }"
    >
      <!--      <template #actionsRender /> -->
      <template #imageRender>
        <video
          muted
          width="100%"
          controls
          src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/file/A*uYT7SZwhJnUAAAAAAAAAAAAADgCCAQ"
        />
      </template>
    </Image>
  </div>
</template>

<style scoped>

</style>
