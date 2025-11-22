<script setup lang="ts">
import Basic from './basic'
import Controlled from './controlled'
import Rtl from './rtl'
import './assets/style.less'
</script>

<template>
  <Story title="Segmented">
    <Variant title="basic">
      <Basic />
    </Variant>
    <Variant title="rtl">
      <Rtl />
    </Variant>
    <Variant title="controlled">
      <Controlled />
    </Variant>
  </Story>
</template>
