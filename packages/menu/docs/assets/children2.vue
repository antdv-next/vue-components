<script setup lang="ts">
import { MenuItem, SubMenu } from '../../src'
</script>

<template>
  <SubMenu key="1">
    <template #title>
      <span class="submenu-title-wrapper">sub menu</span>
    </template>
    <MenuItem key="1-1">0-1</MenuItem>
    <MenuItem key="1-2">0-2</MenuItem>
  </SubMenu>
  <MenuItem key="2">1</MenuItem>
  <MenuItem key="3">outer</MenuItem>
</template>

<style scoped>

</style>
