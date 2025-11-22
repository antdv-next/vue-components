<script setup lang="ts">
import Antd from './antd'
import AntdSwitch from './antd-switch'
import CustomIcon from './custom-icon'
</script>

<template>
  <Story title="Menu">
    <Variant title="antd">
      <Antd />
    </Variant>
    <Variant title="antd-switch">
      <AntdSwitch />
    </Variant>
    <Variant title="custom-icon">
      <CustomIcon />
    </Variant>
  </Story>
</template>
