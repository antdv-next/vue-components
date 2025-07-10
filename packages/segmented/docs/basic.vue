<script setup lang="ts">
import { ref } from 'vue'
import Segmented from '../src'

const data = ['iOS', 'Android', 'Web']
const options = ref(data)
const options1 = ref(data)
const options2 = ref([13333333333, 157110000, 12110086])
const options3 = ref(data)
const options4 = ref([
  'IOS',
  { value: 'Androidbb', disabled: true },
  'WEB',
])

const select = ref(options.value[0])
const select1 = ref(options1.value[0])
const select2 = ref(options2.value[0])
const select3 = ref(options3.value[0])
const select4 = ref(options4.value[0])
</script>

<template>
  <div class="wrapper">
    <Segmented
      v-model:value="select"
      :options="options"
      name="segmented1"
      @change="(value) => console.log(value, typeof value)"
    />
  </div>
  <div class="wrapper">
    <Segmented
      v-model:value="select1"
      vertical
      :options="options1"
      name="segmented2"
      @change="(value) => console.log(value, typeof value)"
    />
  </div>
  <div class="wrapper">
    <Segmented
      v-model:value="select2"
      :options="options2"
      @change="(value) => console.log(value, typeof value)"
    />
  </div>
  <div class="wrapper">
    <Segmented v-model:value="select3" :options="options3" :disabled="true" />
  </div>
  <div class="wrapper">
    <Segmented
      v-model:value="select4"
      :options="options4"
    >
      <template #label="{ value, disabled }">
        {{ value }} - {{ disabled }}
      </template>
    </Segmented>
  </div>
</template>

<style scoped>

</style>
