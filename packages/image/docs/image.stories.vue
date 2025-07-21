<script setup lang="ts">
import ActionsRender from './actionsRender.vue'
import Album from './album.vue'
import Basic from './basic.vue'
import Controlled from './controlled.vue'
import CoverPlacement from './coverPlacement.vue'
import Fallback from './fallback.vue'
import Placeholder from './placeholder.vue'
import Thumbnail from './thumbnail.vue'
import './assets/index.less'
</script>

<template>
  <Story title="Image">
    <Variant title="actionsRender">
      <ActionsRender />
    </Variant>
    <Variant title="album">
      <Album />
    </Variant>
    <Variant title="basic">
      <Basic />
    </Variant>
    <Variant title="controlled">
      <Controlled />
    </Variant>
    <Variant title="coverPlacement">
      <CoverPlacement />
    </Variant>
    <Variant title="fallback">
      <Fallback />
    </Variant>
    <Variant title="placeholder">
      <Placeholder />
    </Variant>
    <Variant title="thumbnail">
      <Thumbnail />
    </Variant>
  </Story>
</template>

<style scoped>

</style>
