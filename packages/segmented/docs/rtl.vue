<script setup lang="ts">
import { ref } from 'vue'
import Segmented from '../src'

const direction = ref<'ltr' | 'rtl'>('ltr')
const select = ref('iOS')
</script>

<template>
  <div class="wrapper">
    <button
      style="padding: 0 8px; margin-right: 8px;"
      @click="() => direction = 'rtl'"
    >
      rtl
    </button>
    <button
      style="padding: 0 8px"
      @click="() => direction = 'ltr'"
    >
      ltr
    </button>
    <p
      style="margin-bottom: 8px"
    />
    <Segmented
      v-model:value="select"
      :options="['iOS', 'Android', 'Web']"
      :direction="direction"
      @change="(value) => console.log(value, typeof value)"
    />
  </div>
</template>

<style scoped>

</style>
