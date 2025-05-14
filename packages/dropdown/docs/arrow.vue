<script setup lang="ts">
import Dropdown from '../src'
import MockMenu from './mock-menu.vue'

function onVisibleChange(visible: boolean) {
  console.log(visible)
}
</script>

<template>
  <div style="margin: 20px">
    <div style="height: 100px; background-color: #ececec">
      <div style="padding-top: 50px">
        <Dropdown
          arrow
          :trigger="['click']"
          animation="slide-up"
          @visible-change="onVisibleChange"
        >
          <button style="width: 100px">
            open
          </button>
          <template #overlay>
            <MockMenu />
          </template>
        </Dropdown>
      </div>
      <div>
        <Dropdown
          placement="topLeft"
          arrow
          :trigger="['click']"
          animation="slide-up"
          @visible-change="onVisibleChange"
        >
          <button style="width: 100px">
            open
          </button>
          <template #overlay>
            <MockMenu />
          </template>
        </Dropdown>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
