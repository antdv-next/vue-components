<script setup lang="ts">
import Single from './single.vue'
import Antd from './antd.vue'
import CustomIcon from "./custom-icon.vue";
import KeyPath from "./keyPath.vue";
import Multiple from "./multiple.vue";
import OpenKeys from "./openKeys.vue";
import RtlAntd from "./rtlAntd.vue";
import Scrollable from "./scrollable.vue";
import SelectedKeys from "./selectedKeys.vue";
import MenuItemGroup from './menuItemGroup.vue'
import './assets/index.less'
</script>

<template>
  <Story title="Menu">
    <Variant title="antd">
      <Antd />
    </Variant>
    <Variant title="customIcon">
      <CustomIcon />
    </Variant>
    <Variant title="keyPath">
      <KeyPath />
    </Variant>
    <Variant title="menuItemGroup">
      <MenuItemGroup />
    </Variant>
    <Variant title="multiple">
      <Multiple />
    </Variant>
    <Variant title="openKeys">
      <OpenKeys />
    </Variant>
    <Variant title="rtl-antd">
      <RtlAntd />
    </Variant>
    <Variant title="scrollable">
      <Scrollable />
    </Variant>
    <Variant title="selectedKeys">
      <SelectedKeys />
    </Variant>
    <Variant title="single">
      <Single />
    </Variant>
  </Story>
</template>

<style scoped>

</style>
