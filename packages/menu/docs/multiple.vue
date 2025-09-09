<script setup lang="ts">
import { ref } from 'vue'
import Menu, { Divider, Item as MenuItem, SubMenu } from '../src'

const destroy = ref(false)
function handleSelect(info: any) {
  console.log('selected ', info)
}

function handleDeselect(info: any) {
  console.log('deselect ', info)
}
</script>

<template>
  <div>
    <h2>multiple selectable menu</h2>

    <button
      type="button"
      @click="() => destroy = !destroy"
    >
      destroy
    </button>
    <div v-if="!destroy" style="width: 400px">
      <Menu
        multiple
        :default-selected-keys="['2', '1-1']"
        @select="handleSelect"
        @deselect="handleDeselect"
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
        <MenuItem key="2" disabled>
          can not deselect me, i am disabled
        </MenuItem>
        <MenuItem key="3">
          outer
        </MenuItem>
        <SubMenu key="4">
          <template #title>
            <span>sub menu1</span>
          </template>
          <MenuItem key="4-1">
            inner inner
          </MenuItem>
          <Divider />
          <SubMenu key="4-2">
            <template #title>
              <span>sub menu2</span>
            </template>
            <MenuItem key="4-2-1">
              inn
            </MenuItem>
            <SubMenu key="4-2-2">
              <template #title>
                <span>sub menu3</span>
              </template>
              <MenuItem key="4-2-2-1">
                inner inner
              </MenuItem>
              <MenuItem key="4-2-2-2">
                inner inner2
              </MenuItem>
            </SubMenu>
          </SubMenu>
        </SubMenu>
        <MenuItem key="disabled" disabled>
          disabled
        </MenuItem>
        <MenuItem key="4-3">
          outer3
        </MenuItem>
      </Menu>
    </div>
  </div>
</template>

<style scoped>

</style>
