<script setup lang="ts">
import Menu, { Item as MenuItem, ItemGroup as MenuItemGroup } from '../src'
</script>

<template>
  <div>
    <h2>menu item group</h2>
    <Menu
      style="margin: 20px; width: 300px"
      :class-names="{ listTitle: 'test-title', list: 'test-list' }"
      @click="() => console.log('click')"
    >
      <MenuItemGroup key="2" title="group 1">
        <MenuItem key="21">
          2
        </MenuItem>
        <MenuItem key="22">
          3
        </MenuItem>
      </MenuItemGroup>
      <MenuItemGroup key="3" title="group 2">
        <MenuItem key="31">
          4
        </MenuItem>
        <MenuItem key="32">
          5
        </MenuItem>
      </MenuItemGroup>
    </Menu>
  </div>
</template>

<style scoped>

</style>
