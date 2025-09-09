<script setup lang="ts">
import Menu, { Item as MenuItem } from '../src'
const menuStyle = {
  width: 200,
  height: 200,
  overflow: 'auto',
}
</script>

<template>
  <div>
    <h2>keyboard scrollable menu</h2>
    <Menu :style="menuStyle">
      <MenuItem v-for="i in 20" :key="i">
        {{ i }}
      </MenuItem>
    </Menu>
  </div>
</template>

<style scoped>

</style>