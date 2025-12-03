<script setup lang="ts">
import Animate from './animate.vue'
import Basic from './basic.vue'
import Height from './height.vue'
import Nest from './nest.vue'
import NoVirtual from './no-virtual.vue'
import Switch from './switch.vue'
</script>

<template>
  <Story title="Virtual List">
    <Variant title="Basic">
      <Basic />
    </Variant>
    <Variant title="Animate">
      <Animate />
    </Variant>

    <Variant title="Dynamic Height">
      <Height />
    </Variant>

    <Variant title="No Virtual">
      <NoVirtual />
    </Variant>

    <Variant title="Switch Data">
      <Switch />
    </Variant>

    <Variant title="Nested">
      <Nest />
    </Variant>
  </Story>
</template>
