<script setup lang="ts">
import { ref } from 'vue'
import Image from '../src'
import { defaultIcons } from './assets/common.tsx'

const placement = ref('center')
</script>

<template>
  <div>
    <div>
      <label>
        <span>placement:</span>
      </label>
      <select id="placement" v-model="placement">
        <option value="top">
          top
        </option>
        <option value="bottom">
          bottom
        </option>
        <option value="center">
          center
        </option>
      </select>
    </div>
    <br>
    <Image
      src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
      width="200px"
      :preview="{
        icons: defaultIcons,
        onOpenChange: (open: boolean) => {
          console.log('open', open);
        },
        zIndex: 9999,
        cover: {
          coverNode: 'Click to Preview',
          placement,
        },
      }"
      @click="() => {
        console.log('click');
      }"
    />
  </div>
</template>

<style scoped>

</style>
