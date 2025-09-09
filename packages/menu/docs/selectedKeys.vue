<script setup lang="ts">
import { ref } from 'vue'
import Menu, { Item as MenuItem, SubMenu } from '../src'

const selectedKeys = ref([])
const openKeys = ref([])
const allSelectedKeys = ['1-1', '1-2', '2-1', '2-2', '3']
const allOpenKeys = ['1', '2']

function onSelect(info) {
  console.log('selected', info)
  selectedKeys.value = info.selectedKeys
}
function onDeselect(info) {
  console.log('deselected', info)
}
function onOpenChange(keys) {
  openKeys.value = keys
}
function onCheck(info) {
  const { value } = e.target
  if (e.target.checked) {
    selectedKeys.value = selectedKeys.value.concat(value)
  }
  else {
    const newSelectedKeys = selectedKeys.value.concat()
    const index = newSelectedKeys.value.indexOf(value)
    if (value !== -1) {
      newSelectedKeys.value.splice(index, 1)
    }
    selectedKeys.value = newSelectedKeys
  }
}
function onOpenCheck(info) {
  const { value } = e.target
  if (e.target.checked) {
    openKeys.value = openKeys.value.concat(value)
  }
  else {
    const newOpenKeys = openKeys.value.concat()
    const index = newOpenKeys.value.indexOf(value)
    if (value !== -1) {
      newOpenKeys.value.splice(index, 1)
    }
    openKeys.value = newOpenKeys
  }
}
</script>

<template>
  <div>
    <h2>multiple selectable menu</h2>

    <p>
      selectedKeys: &nbsp;&nbsp;&nbsp;
      <label v-for="k in allSelectedKeys" :key="k">
        {{ k }}
        <input
          :key="k"
          :value="k"
          type="checkbox"
          :checked="selectedKeys.indexOf(k) !== -1"
          @change="onCheck"
        >
      </label>
    </p>

    <p>
      openKeys: &nbsp;&nbsp;&nbsp;
      <label v-for="k in allOpenKeys" :key="k">
        {{ k }}
        <input
          :key="k"
          :value="k"
          type="checkbox"
          :checked="openKeys.indexOf(k) !== -1"
          @change="onOpenCheck"
        >
      </label>
    </p>

    <div style="width: 400px">
      <Menu
        multiple
        :open-keys="openKeys"
        :selected-keys="selectedKeys"
        @select="onSelect"
        @deselect="onDeselect"
        @open-change="onOpenChange"
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
