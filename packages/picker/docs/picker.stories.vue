<script setup lang="ts">
import Basic from './basic.vue'
import Calendar from './calendar.vue'
import CellRender from './cellRender.vue'
import Range from './range.vue'
</script>

<template>
  <Story title="Picker">
    <Variant title="Basic">
      <Basic />
    </Variant>
    <Variant title="Calendar">
      <Calendar />
    </Variant>
    <Variant title="CellRender">
      <CellRender />
    </Variant>
    <Variant title="Range">
      <Range />
    </Variant>
  </Story>
</template>
