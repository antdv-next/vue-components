<script setup lang="ts">
import AllowClear from './allow-clear'
import AutoSize from './auto-size'
import ShowCount from './show-count'
import Simple from './simple'

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
