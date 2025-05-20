<script setup lang="ts">
import AllowClear from './allowClear.vue'
import AutoSize from './autoSize.vue'
import ShowCount from './showCount.vue'
import Simple from './simple.vue'

import './assets/index.less'
</script>

<template>
  <Story title="Textarea">
    <Variant title="Simple">
      <Simple />
    </Variant>
    <Variant title="Auto Size">
      <AutoSize />
    </Variant>
    <Variant title="Allow Clear">
      <AllowClear />
    </Variant>
    <Variant title="Show Count">
      <ShowCount />
    </Variant>
  </Story>
</template>

<style scoped>

</style>
