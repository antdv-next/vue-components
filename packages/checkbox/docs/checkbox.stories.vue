<script setup lang="ts">
import { ref } from 'vue'
import Basic from '../src'

const checked = ref(false)
const selected = ref('a')
</script>

<template>
  <Story title="Checkbox">
    <Variant title="Basic">
      <Basic />
    </Variant>
    <Variant title="Controlled checkboxes (updates rejected)">
      <label><Basic :checked="false" /> Always unchecked</label>
      <label><Basic :checked="true" /> Always checked</label>
    </Variant>
    <Variant title="Controlled radios (updates rejected)">
      <label><Basic type="radio" name="fixed-choice" value="a" :checked="true" /> A</label>
      <label><Basic type="radio" name="fixed-choice" value="b" :checked="false" /> B</label>
    </Variant>
    <Variant title="Controlled updates accepted">
      <label><Basic v-model:checked="checked" /> Checkbox: {{ checked }}</label>
      <label><Basic type="radio" name="model-choice" value="a" :checked="selected === 'a'" @change="selected = 'a'" /> A</label>
      <label><Basic type="radio" name="model-choice" value="b" :checked="selected === 'b'" @change="selected = 'b'" /> B</label>
    </Variant>
  </Story>
</template>
