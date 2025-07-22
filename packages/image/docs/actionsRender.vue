<script setup lang="ts">
import Image from '../src'
import { defaultIcons } from './assets/common.tsx'
</script>

<template>
  <Image
    src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
    width="200px"
    :preview="
      {
        icons: defaultIcons,
      }
    "
  >
    <template
      #actionsRender="{ actions: {
        onFlipY,
        onFlipX,
        onRotateLeft,
        onRotateRight,
        onZoomIn,
        onZoomOut,
        onClose,
        onReset,
      } }"
    >
      <div
        style="position: fixed; display: flex; width: 100%; gap: 10px; justify-content: center"
      >
        <button @click="onFlipY">
          flipY
        </button>
        <button @click="onFlipX">
          flipX
        </button>
        <button @click="onRotateLeft">
          rotateLeft
        </button>
        <button @click="onRotateRight">
          rotateRight
        </button>
        <button @click="onZoomIn">
          zoomIn
        </button>
        <button @click="onZoomOut">
          zoomOut
        </button>
        <button @click="() => onReset()">
          reset
        </button>
        <button @click="onClose">
          close
        </button>
      </div>
    </template>
  </Image>
  <Image
    src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
    width="200px"
    height="200px"
    alt="test"
    :preview="{
      icons: defaultIcons,
    }"
  >
    <template #imageRender="_, { image }">
      {{ JSON.stringify(image) }}
    </template>
    <template #actionsRender="{ actionsNode, image }">
      <component :is="actionsNode" />
      <div>一些自定义</div>
      {{ JSON.stringify(image) }}
    </template>
  </Image>
</template>

<style scoped>

</style>
