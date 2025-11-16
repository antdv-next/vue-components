<script setup lang="ts">
import type { CollapseProps } from '../src/index'
import { h, ref, shallowRef, watch } from 'vue'
import Collapse from '../src/index'

const initLength = 3

const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`

function random() {
  return parseInt((Math.random() * 10).toString(), 10) + 1
}

const arrowPath
  = 'M869 487.8L491.2 159.9c-2.9-2.5-6.6-3.9-10.5-3.9h-88'
    + '.5c-7.4 0-10.8 9.2-5.2 14l350.2 304H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.'
    + '6 8 8 8h585.1L386.9 854c-5.6 4.9-2.2 14 5.2 14h91.5c1.9 0 3.8-0.7 5.'
    + '2-2L869 536.2c14.7-12.8 14.7-35.6 0-48.4z'

function expandIcon({ isActive }: { isActive: boolean }) {
  return h(
    'i',
    {
      style: {
        'margin-right': '.5rem',
      },
    },
    [
      h(
        'svg',
        {
          viewBox: '0 0 1024 1024',
          width: '1em',
          height: '1em',
          fill: 'currentColor',
          style: {
            verticalAlign: '-.125em',
            transition: 'transform .2s',
            transform: `rotate(${isActive ? 90 : 0}deg)`,
          },
        },
        [
          h('path', {
            d: arrowPath,
          }),
        ],
      ),
    ],
  )
}

const rerender = ref(0)
const accordion = ref(false)
const activeKey = ref<Array<string | number | bigint>>(['4'])

const time = ref(random())
watch(
  () => [rerender.value, accordion.value, activeKey.value],
  () => {
    time.value = random()
  },
)

function handleSetActiveKey(e: Array<string | number | bigint>) {
  activeKey.value = e
}

function getCollapsedHeight(el: HTMLDivElement) {
  el.style.height = '0'
  el.style.opacity = '0'
}
function getRealHeight(el: HTMLDivElement) {
  console.log(el.scrollHeight)
  el.style.height = `${el.scrollHeight}px`
  el.style.opacity = '1'
}
function getCurrentHeight(el: HTMLDivElement) {
  el.style.height = `${el.offsetHeight}px`
}

function skipOpacityTransition(el: HTMLDivElement) {
  el.style.height = ''
}
const openMotion = {
  name: 'vc-collapse',
  onBeforeEnter: getCollapsedHeight,
  onEnter: getRealHeight,
  onAfterEnter: skipOpacityTransition,
  onBeforeLeave: getCurrentHeight,
  onLeave: getCollapsedHeight,
  onAfterLeave: skipOpacityTransition,
}

const items = shallowRef<CollapseProps['items']>([])
function handleUpdateItems() {
  items.value = Array.from({ length: initLength })
    .map((_, i) => {
      return {
        label: `This is panel header ${i + 1}`,
        key: i + 1,
        children: h('p', {}, [text.repeat(time.value)]),
      }
    })
    .concat([
      {
        label: `This is panel header ${initLength + 1}`,
        key: initLength + 1,
        children: h(Collapse, {
          defaultActiveKey: '1',
          expandIcon,
          items: [
            {
              label: 'This is panel nest panel',
              key: '1',
              children: h('p', {}, [text]),
            },
          ],
        }),
      },
      {
        label: `This is panel header ${initLength + 2}`,
        key: initLength + 2,
        children: h(Collapse, {
          defaultActiveKey: '1',
          items: [
            {
              label: 'This is panel nest panel',
              children: h('form', {}, [
                h(
                  'label',
                  {
                    htmlFor: 'test',
                  },
                  ['Name:&nbsp;'],
                ),
                h('input', {
                  type: 'text',
                  id: 'test',
                }),
              ]),
            },
          ],
        }),
      },
    ])
}
watch(
  () => time.value,
  () => {
    handleUpdateItems()
  },
  { immediate: true },
)
</script>

<template>
  <button type="button" @click="rerender += 1">
    reRender
  </button>
  <br>
  <br>
  <button type="button" @click="accordion = !accordion">
    {{ accordion ? "Mode: accordion" : "Mode: collapse" }}
  </button>
  <br>
  <br>
  <button type="button" @click="activeKey = ['2']">
    active header 2
  </button>
  <br>
  <br>

  <Collapse
    :accordion="accordion"
    :active-key="activeKey"
    :expand-icon="expandIcon"
    :open-motion="openMotion"
    :items="items"
    @change="handleSetActiveKey"
  />
</template>
