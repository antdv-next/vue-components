<script setup lang="ts">
import { ref } from 'vue'
import Image from '../src'
import { defaultIcons } from './assets/common.tsx'

const open = ref(false)
</script>

<template>
  <div>
    <div>
      <button
        type="button"
        @click="() => {
          open = true
        }"
      >
        Switch Preview
      </button>
    </div>
    <Image
      src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
      width="200px"
      :preview="{
        icons: defaultIcons,
        open,
        onOpenChange: (value: boolean) => {
          open = value
        },
      }"
    />
  </div>
</template>

<style scoped>

</style>
