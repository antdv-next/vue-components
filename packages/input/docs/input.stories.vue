<script setup lang="ts">
import Addon from './addon.vue'
import AllowClear from './allowclear.vue'
import Basic from './basic.vue'
import PrefixSuffix from './prefixSuffix.vue'
import ShowCount from './showCount.vue'

import './assets/index.less'
</script>

<template>
  <Story title="input">
    <Variant title="addon">
      <Addon />
    </Variant>
    <Variant title="allow-clear">
      <AllowClear />
    </Variant>
    <Variant title="basic">
      <Basic />
    </Variant>
    <Variant title="prefix-suffix">
      <PrefixSuffix />
    </Variant>
    <Variant title="show-count">
      <ShowCount />
    </Variant>
  </Story>
</template>

<style scoped>

</style>
