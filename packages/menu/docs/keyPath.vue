<script setup lang="ts">
import Menu, { SubMenu, Item as MenuItem } from '../src'

function handleClickChange(info: any) {
  console.log('click', info)
}
</script>

<template>
  <div>
    <div style="width: 400px">
      <Menu mode="inline" @click="handleClickChange">
        <SubMenu key="1" title="submenu1">
          <MenuItem key="1-1">item1-1</MenuItem>
          <MenuItem key="1-2">item1-2</MenuItem>
        </SubMenu>
        <SubMenu key="2" title="submenu2">
          <MenuItem key="2-1">item2-1</MenuItem>
          <MenuItem key="2-2">item2-2</MenuItem>
          <SubMenu key="2-3" title="submenu2-3">
            <MenuItem key="2-3-1">item2-3-1</MenuItem>
            <MenuItem key="2-3-2">item2-3-2</MenuItem>
          </SubMenu>
        </SubMenu>
        <MenuItem key="3">item3</MenuItem>
      </Menu>
    </div>
  </div>
</template>

<style scoped>

</style>