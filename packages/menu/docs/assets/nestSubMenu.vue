<script setup lang="ts">
import { Divider, MenuItem, SubMenu } from '../../src'
</script>

<template>
  <SubMenu
    key="4"
    :popup-offset="[10, 15]"
  >
    <template #title>
      <span class="submenu-title-wrapper">offset sub menu 2</span>
    </template>
    <MenuItem key="4-1">
      inner inner
    </MenuItem>
    <Divider />
    <SubMenu key="4-2">
      <template #title>
        <span class="submenu-title-wrapper">sub menu 1</span>
      </template>
      <SubMenu key="4-2-0">
        <template #title>
          <span class="submenu-title-wrapper">sub 4-2-0</span>
        </template>
        <MenuItem key="4-2-0-1">
          inner inner
        </MenuItem>
        <MenuItem key="4-2-0-2">
          inner inner2
        </MenuItem>
      </SubMenu>
      <MenuItem key="4-2-1">
        inn
      </MenuItem>
      <SubMenu key="4-2-2">
        <template #title>
          <span class="submenu-title-wrapper">sub menu 4</span>
        </template>
        <MenuItem key="4-2-2-1">
          inner inner
        </MenuItem>
        <MenuItem key="4-2-2-2">
          inner inner2
        </MenuItem>
      </SubMenu>
      <SubMenu key="4-2-3">
        <template #title>
          <span class="submenu-title-wrapper">sub menu 3</span>
        </template>
        <MenuItem key="4-2-3-1">
          inner inner
        </MenuItem>
        <MenuItem key="4-2-3-2">
          inner inner2
        </MenuItem>
      </SubMenu>
    </SubMenu>
  </SubMenu>
</template>

<style scoped>

</style>
