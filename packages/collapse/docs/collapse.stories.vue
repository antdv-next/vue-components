<script setup lang="ts">
import type { CollapseProps } from '../src/interface'
import { h } from 'vue'
import Collapse from '../src/index'
import CustomIcon from './custom-icon.vue'
import Simple from './simple.vue'
import '../assets/index.less'

const basicCollapseItems: CollapseProps['items'] = [
  {
    label: h('input', {
      onKeydown: (e: KeyboardEvent) => {
        e.stopPropagation()
      },
    }),
    children: 'content',
  },
  {
    label: 'title 2',
    children: 'content 2',
    collapsible: 'disabled',
  },
  {
    label: 'title 3',
    children: 'content 3',
    onItemClick: console.log,
  },
]
</script>

<template>
  <Story title="Collapse">
    <Variant title="Basic">
      <Collapse :items="basicCollapseItems" />
    </Variant>

    <Variant title="custom icon">
      <CustomIcon />
    </Variant>

    <Variant title="simple">
      <Simple />
    </Variant>
  </Story>
</template>
