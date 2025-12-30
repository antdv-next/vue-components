<script setup lang="ts">
import Basic from './basic.vue'
import Calendar from './calendar.vue'
import CellRender from './cellRender.vue'
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
  </Story>
</template>
