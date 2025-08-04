<script setup lang="ts">
import AsyncAction from './acyncAction.vue'
import BeforeUpload from './beforeUpload.vue'
import CustomRequest from './customRequest.vue'
import DirectoryUpload from "./directoryUpload.vue";
import Drag from "./drag.vue";
import DragDirectory from "./dragDirectory.vue";
import Paste from "./paste.vue";
import PasteDirectory from "./pasteDirectory.vue";
import Simple from "./simple.vue";
</script>

<template>
  <Story title="Upload">
    <Variant title="AsyncAction">
      <AsyncAction />
    </Variant>
    <Variant title="BeforeUpload">
      <BeforeUpload />
    </Variant>
    <Variant title="CustomRequest">
      <CustomRequest />
    </Variant>
    <Variant title="DirectoryUpload">
      <DirectoryUpload />
    </Variant>
    <Variant title="Drag">
      <Drag />
    </Variant>
    <Variant title="DragDirectory">
      <DragDirectory />
    </Variant>
    <Variant title="Paste">
      <Paste />
    </Variant>
    <Variant title="PasteDirectory">
      <PasteDirectory />
    </Variant>
    <Variant title="Simple">
      <Simple />
    </Variant>
  </Story>
</template>

<style scoped>

</style>
