<script setup lang="ts">
import Menu, { Divider, Item as MenuItem, SubMenu } from '../../src'
</script>

<template>
  <Menu
    v-bind="$attrs"
    @click="{ handleClick }"
    @open-change="{ onOpenChange }"
  >
    <SubMenu key="1">
      <template #title>
        <span>sub menu</span>
      </template>
      <MenuItem key="1-1">
        0-1
      </MenuItem>
      <MenuItem key="1-2">
        0-2
      </MenuItem>
    </SubMenu>
    <SubMenu
      key="4"
      :popup-offset="[10, 15]"
      v-bind="$attrs"
    >
      <template #title>
        <span>offset sub menu 2</span>
      </template>
      <MenuItem key="4-1">
        inner inner
      </MenuItem>
      <Divider />
      <SubMenu key="4-2">
        <template #title>
          <span>sub menu 3</span>
        </template>
        <SubMenu key="4-2-0" title="sub 4-2-0">
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
            <span>sub menu 4</span>
          </template>
          <MenuItem key="4-2-2-1">
            inner inner
          </MenuItem>
          <MenuItem key="4-2-2-2">
            inner inner2
          </MenuItem>
        </SubMenu>
        <SubMenu key="4-2-3" title="sub 4-2-3">
          <MenuItem key="4-2-3-1">
            inner inner
          </MenuItem>
          <MenuItem key="4-2-3-2">
            inner inner2
          </MenuItem>
        </SubMenu>
      </SubMenu>
    </SubMenu>
    <MenuItem key="2">
      1
    </MenuItem>
    <MenuItem key="3">
      outer
    </MenuItem>
    <MenuItem disabled>
      disabled
    </MenuItem>
    <MenuItem key="5">
      outer3
    </MenuItem>
  </Menu>
</template>

<style scoped>

</style>
