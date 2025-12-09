<script setup lang="ts">
import Rate from '../src'

function onChange(v: number) {
  console.log('selected star', v)
}
</script>

<template>
  <div class="m-50px">
    <h2>Base</h2>
    <Rate
      :default-value="2.5"
      style="font-size: 40px"
      allow-half
      :allow-clear="false"
      @change="onChange"
    />
    <br>
  </div>
</template>
