<script setup lang="ts">
import ActionsRender from './actionsRender'
import Album from './album'
import Basic from './basic'
import Controlled from './controlled'
import ControlledWithGroup from './controlledWithGroup'
import CoverPlacement from './coverPlacement'
import Fallback from './fallback'
import ImageRender from './imageRender'
import Placeholder from './placeholder'
import PreviewGroup from './previewGroup'
import PreviewGroupItems from './previewGroupItems'
import Thumbnail from './thumbnail'
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
    <Variant title="controlledWithGroup">
      <ControlledWithGroup />
    </Variant>
    <Variant title="coverPlacement">
      <CoverPlacement />
    </Variant>
    <Variant title="fallback">
      <Fallback />
    </Variant>
    <Variant title="imageRender">
      <ImageRender />
    </Variant>
    <Variant title="placeholder">
      <Placeholder />
    </Variant>
    <Variant title="previewGroup">
      <PreviewGroup />
    </Variant>
    <Variant title="previewGroupItems">
      <PreviewGroupItems />
    </Variant>
    <Variant title="thumbnail">
      <Thumbnail />
    </Variant>
  </Story>
</template>
