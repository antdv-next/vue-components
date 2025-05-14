<script setup lang="ts">
import Dropdown from '../src'
import MockMenu from './mock-menu.vue'

function onVisibleChange(visible: boolean) {
  console.log('change', visible)
}
function onOverlayClick(e: Event) {
  console.log(e)
}
</script>

<template>
  <div style="margin: 20px">
    <div style="height: 100px; background-color: #ececec">
      <div style="padding-top: 75px">
        <Dropdown
          auto-focus
          :trigger="['click']"
          animation="slide-up"
          @visible-change="onVisibleChange"
          @overlay-click="onOverlayClick"
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
