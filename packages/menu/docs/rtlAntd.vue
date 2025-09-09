<script setup lang="tsx">
import CommonMenu from './assets/commonMenu.vue'

function collapseNode() {
  return { height: 0 }
}
function expandNode(node) {
  return { height: node.scrollHeight }
}

const horizontalMotion = {
  motionName: 'vc-menu-open-slide-up',
  motionAppear: true,
  motionEnter: true,
  motionLeave: true,
}

const verticalMotion = {
  motionName: 'vc-menu-open-zoom',
  motionAppear: true,
  motionEnter: true,
  motionLeave: true,
}

const inlineMotion = {
  motionName: 'vc-menu-collapse',
  motionAppear: true,
  onAppearStart: collapseNode,
  onAppearActive: expandNode,
  onEnterStart: collapseNode,
  onEnterActive: expandNode,
  onLeaveStart: expandNode,
  onLeaveActive: collapseNode,
}

const motionMap = {
  horizontal: horizontalMotion,
  inline: inlineMotion,
  vertical: verticalMotion,
}
</script>

<template>
  <div style="margin: 20px">
    <h2>antd menu</h2>
    <div>
      <h3>horizontal</h3>

      <div style="margin: 20px">
        <CommonMenu
            mode="horizontal"
            :default-motions="motionMap"
            diection="rtl"
        />
      </div>
      <h3>horizontal and click</h3>

      <div style="margin: 20px">
        <CommonMenu
            mode="horizontal"
            :default-motions="motionMap"
            trigger-sub-menu-action="click"
            update-children-and-overflowed-indicator
            diection="rtl"
        />
      </div>
      <h3>vertical</h3>

      <div style="margin: 20px; width: 200px">
        <CommonMenu
            mode="vertical"
            :default-motions="motionMap"
        />
      </div>
      <h3>inline</h3>

      <div style="margin: 20px; width: 200px">
        <CommonMenu
            mode="inline"
            :default-motions="motionMap"
            :default-open-keys="['1']"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
