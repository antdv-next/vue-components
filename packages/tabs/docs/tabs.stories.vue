<script setup lang="ts">
import Animated from './animated.vue';
import Basic from './basic.vue'
import DynamicExtra from './dynamic-extra.vue';
import Editable from './editable.vue';
import Extra from './extra.vue';
import Indicator from './indicator.vue';
</script>

<template>
  <Story title="Tabs">
    <Variant title="Basic">
      <Basic />
    </Variant>

    <Variant title="Animated">
      <Animated />
    </Variant>

    <Variant title="DynamicExtra">
      <DynamicExtra />
    </Variant>

    <Variant title="Editable">
      <Editable />
    </Variant>

    <Variant title="Extra">
      <Extra />
    </Variant>

    <Variant title="Indicator">
      <Indicator />
    </Variant>

  </Story>
</template>
