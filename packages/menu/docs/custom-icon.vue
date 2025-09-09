<script setup lang="ts">
import { Fragment, h } from 'vue'
import RenderCommonMenu from './assets/renderCommonMenu.vue'

function getSvgIcon(style = {}, text?: any) {
  if (text) {
    return h('i', { style }, text)
  }
  const path
      = 'M869 487.8L491.2 159.9c-2.9-2.5-6.6-3.9-10.5-3.9h'
        + '-88.5c-7.4 0-10.8 9.2-5.2 14l350.2 304H152c-4.4 0-8 3.6-8 8v'
        + '60c0 4.4 3.6 8 8 8h585.1L386.9 854c-5.6 4.9-2.2 14 5.2 14h91'
        + '.5c1.9 0 3.8-0.7 5.2-2L869 536.2c14.7-12.8 14.7-35.6 0-48.4z'
  return h(Fragment, {}, [
    h('i', { style }),
    h('svg', {
      viewBox: '0 0 1024 1024',
      width: '1em',
      height: '1em',
      fill: 'currentColor',
      style: {
        verticalAlign: '-.125em',
      },
    }, [
      h('path', {
        d: path,
      }),
    ]),
  ])
}

function itemIcon(props) {
  return getSvgIcon({
    position: 'absolute',
    right: '1rem',
    color: props.isSelected ? 'pink' : 'inherit',
  })
}

function expandIcon(props) {
  return getSvgIcon({
    position: 'absolute',
    right: '1rem',
    color: 'lightblue',
    transform: `rotate(${props.isOpen ? 90 : 0}deg)`,
  })
}

const collapseNode = () => ({ height: 0 })
const expandNode = node => ({ height: node.scrollHeight })

const inlineMotion = {
  motionName: 'vc-menu-collapse',
  onAppearStart: collapseNode,
  onAppearActive: expandNode,
  onEnterStart: collapseNode,
  onEnterActive: expandNode,
  onLeaveStart: expandNode,
  onLeaveActive: collapseNode,
}
</script>

<template>
  <div style="margin: 20px">
    <h2>Antd menu - Custom icon</h2>
    <div>
      <h3>vertical</h3>
      <div style="margin: 20px; width: 200px">
        <RenderCommonMenu
          mode="vertical"
          open-animation="zoom"
          :item-icon="itemIcon"
          :expand-icon="expandIcon"
        />>
      </div>
      <h3>inline</h3>
      <div style="margin: 20px; width: 200px">
        <RenderCommonMenu
          mode="inline"
          :default-open-keys="['1']"
          :motion="inlineMotion"
          :item-icon="itemIcon"
          :expand-icon="expandIcon"
        />>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
