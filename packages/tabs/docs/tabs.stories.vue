<script setup lang="ts">
import Animated from './animated.vue'
import Basic from './basic.vue'
import DynamicExtra from './dynamic-extra.vue'
import Editable from './editable.vue'
import Extra from './extra.vue'
import Indicator from './indicator.vue'
import Mix from './mix.vue'
import Overflow from './overflow.vue'
import Position from './position.vue'
import RenderTabBarDragable from './renderTabBar-dragable.vue'
import RenderTabBarSticky from './renderTabBar-sticky.vue'
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

    <Variant title="Position">
      <Position />
    </Variant>

    <Variant title="Indicator">
      <Indicator />
    </Variant>

    <Variant title="Mix">
      <Mix />
    </Variant>

    <Variant title="Overflow">
      <Overflow />
    </Variant>

    <Variant title="RenderTabBar-Dragable">
      <RenderTabBarDragable />
    </Variant>

    <Variant title="RenderTabBar-Sticky">
      <RenderTabBarSticky />
    </Variant>
  </Story>
</template>
