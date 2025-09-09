<script setup lang="ts">
import { ref } from 'vue'
import Menu, { Item as MenuItem, SubMenu } from '../src'

const openKeys = ref([])
</script>

<template>
  <div>
    <div style="width: 400px;">
      <Menu
        mode="inline"
        :open-keys="openKeys"
        @click="(info) => console.log('click', info)"
        @open-change="(keys) => {
          console.log('openKeys', keys)
          openKeys = keys
        }"
      >
        <SubMenu key="1" title="submenu1">
          <MenuItem key="1-1">
            item1-1
          </MenuItem>
          <MenuItem key="1-2">
            item1-2
          </MenuItem>
        </SubMenu>
        <SubMenu key="2" title="submenu2">
          <MenuItem key="2-1">
            item2-1
          </MenuItem>
          <MenuItem key="2-2">
            item2-2
          </MenuItem>
        </SubMenu>
        <MenuItem key="3">
          item3
        </MenuItem>
      </Menu>
    </div>
  </div>
</template>

<style scoped>

</style>
