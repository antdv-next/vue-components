<script setup lang="ts">
import { computed, ref } from 'vue'
import getMiniDecimal from '../src'

const num1 = ref(0.1)
const num2 = ref(0.2)

// Add
const add = computed(() => getMiniDecimal(num1.value).add(num2.value).toString()) // 0.3

// Multi
const multi = computed(() => getMiniDecimal(num1.value).multi(num2.value).toString()) // 0.02

// Negate
const negate = computed(() => getMiniDecimal('0.1').negate().toString()) // -0.1

// Equal
// getMiniDecimal('0.1').equals('0.1') // true
// getMiniDecimal('0.1').equals('0.2') // false

// Less Equals
// getMiniDecimal('0.1').lessEquals('0.2') // true
// getMiniDecimal('0.1').lessEquals('0.1') // false
</script>

<template>
  <Story title="MiniDecimal">
    <Variant title="base">
      <input v-model="num1" type="number">
      <kbd>&nbsp;+&nbsp;</kbd>
      <input v-model="num2" type="number">
      <kbd>&nbsp;=&nbsp;</kbd>
      {{ add }}
      <hr>
      multi: {{ multi }}
      <hr>
      negate: {{ negate }}
    </Variant>
  </Story>
</template>

<style scoped>

</style>
