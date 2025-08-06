<script setup lang="ts">
import type { ItemRender } from '../src/interface'
import { computed, h, ref } from 'vue'
import Pagination from '../src/index'
import '../assets/index.less'

// controlled
const current = ref(1)
function handleChange(page: number) {
  current.value = page
}
// itemRender
const itemRender: ItemRender = (current, type, element) => {
  if (type === 'page') {
    return h('a', { href: `#${current}` }, { default: () => current })
  }
  return element
}

const textItemRender: ItemRender = (_current, type, element) => {
  if (type === 'prev') {
    return 'Prev'
  }
  if (type === 'next') {
    return 'Next'
  }
  return element
}

const buttonItemRender: ItemRender = (_current, type, element) => {
  if (type === 'prev') {
    return h('button', { type: 'button' }, { default: () => 'Prev' })
  }
  if (type === 'next') {
    return h('button', { type: 'button' }, { default: () => 'Next' })
  }
  return element
}

const divItemRender: ItemRender = (_current, type, element) => {
  if (type === 'prev') {
    return h('div', {}, { default: () => 'Prev' })
  }
  if (type === 'next') {
    return h('div', {}, { default: () => 'Next' })
  }
  return element
}

// lessPages
const arrowPath
  = 'M869 487.8L491.2 159.9c-2.9-2.5-6.6-3.9-10.5-3.9h'
  + '-88.5c-7.4 0-10.8 9.2-5.2 14l350.2 304H152c-4.4 0-8 3.6-8 8v'
  + '60c0 4.4 3.6 8 8 8h585.1L386.9 854c-5.6 4.9-2.2 14 5.2 14h91'
  + '.5c1.9 0 3.8-0.7 5.2-2L869 536.2c14.7-12.8 14.7-35.6 0-48.4z'

const doublePath = [
  'M533.2 492.3L277.9 166.1c-3-3.9-7.7-6.1-12.6-6.1H188c-6'
  + '.7 0-10.4 7.7-6.3 12.9L447.1 512 181.7 851.1c-4.1 5.2-0'
  + '.4 12.9 6.3 12.9h77.3c4.9 0 9.6-2.3 12.6-6.1l255.3-326.'
  + '1c9.1-11.7 9.1-27.9 0-39.5z',
  'M837.2 492.3L581.9 166.1c-3-3.9-7.7-6.1-12.6-6.1H492c-6'
  + '.7 0-10.4 7.7-6.3 12.9L751.1 512 485.7 851.1c-4.1 5.2-0'
  + '.4 12.9 6.3 12.9h77.3c4.9 0 9.6-2.3 12.6-6.1l255.3-326.'
  + '1c9.1-11.7 9.1-27.9 0-39.5z',
]
function getSvgIcon(path: string | string[], reverse: boolean, type: string) {
  const paths = Array.isArray(path) ? path : [path]
  const renderPaths = paths.map((p, i) => (
    h('path', { d: p, key: i })
  ))
  return (
    h('i', { class: `custom-icon-${type}`, style: { fontSize: '16px' } }, [
      h('svg', {
        viewBox: '0 0 1024 1024',
        width: '1em',
        height: '1em',
        fill: 'currentColor',
        style: { verticalAlign: '-.125em', transform: `rotate(${(reverse && 180) || 0}deg)` },
      }, renderPaths),
    ])
  )
}

const nextIcon = getSvgIcon(arrowPath, false, 'next')
const prevIcon = getSvgIcon(arrowPath, true, 'prev')
const jumpNextIcon = () => getSvgIcon(doublePath, false, 'jump-next')
const jumpPrevIcon = () => getSvgIcon(doublePath, true, 'jump-prev')

const useIcon = ref(true)
function toggleCustomIcon() {
  useIcon.value = !useIcon.value
}
const lessPagesCurrent = ref(3)
function lessPagesChange() {

}
const iconsProps = computed(() => {
  return (useIcon.value && {
    prevIcon,
    nextIcon,
    jumpNextIcon,
    jumpPrevIcon,
  }) || {}
})

// show title
const showTitleCurrent = ref(3)
function setShowTitleState(current: number) {
  showTitleCurrent.value = current
}

// show total
const showTotal1 = (total: number) => `Total ${total} items`
const showTotal2 = (total: number, range: Array<number>) => `${range[0]} - ${range[1]} of ${total} items`
const showTotal3 = (total: number, range: Array<number>) => `${range[0]} - ${range[1]} of ${total} items`
</script>

<template>
  <Story title="Pagination">
    <Variant title="align">
      <Pagination align="start" />
      <Pagination align="center" />
      <Pagination align="end" />
    </Variant>

    <Variant title="basic">
      <Pagination :total="25" />
      <Pagination :total="50" />
      <Pagination :total="60" />
      <Pagination :total="70" />
      <Pagination :total="80" />
      <Pagination :total="90" />
      <Pagination :total="100" />
      <Pagination :total="120" />
      <Pagination :total="500" />
    </Variant>

    <Variant title="controlled">
      <Pagination :total="25" :current="current" @change="handleChange" />
    </Variant>

    <Variant title="itemRender">
      <Pagination :total="100" :item-render="itemRender" />
      <Pagination :total="100" :item-render="textItemRender" />
      <Pagination :total="100" :item-render="buttonItemRender" />
      <Pagination :total="100" :item-render="divItemRender" />
    </Variant>

    <Variant title="jumper" />

    <Variant title="lessPages">
      <div>
        <Pagination
          :current="lessPagesCurrent" :total="80" show-less-items :style="{ marginBottom: '2rem' }"
          v-bind="iconsProps" @change="lessPagesChange"
        />
        <Pagination show-less-items :default-current="1" :total="60" v-bind="iconsProps" />
        <div>
          <button @click="toggleCustomIcon">
            Toggle Custom Icon
          </button>
          <span :style="{ marginLeft: '1rem' }">
            Is using icon: {{ useIcon }}
          </span>
        </div>
      </div>
    </Variant>

    <Variant title="more">
      <Pagination class-name="ant-pagination" :default-current="3" :total="450" />
    </Variant>

    <Variant title="showTitle">
      <Pagination
        :current="showTitleCurrent" :total="80" show-less-items :show-title="false"
        @change="setShowTitleState"
      />
      <Pagination show-less-items :default-current="1" :total="60" :show-title="false" />
    </Variant>

    <Variant title="showTotal">
      <Pagination :show-total="showTotal1" :total="455" />
      <br>
      <Pagination :show-total="showTotal2" :total="455" />
      <br>
      <Pagination :show-total="showTotal3" :total="0" />
    </Variant>

    <Variant title="styles">
      <Pagination :default-current="2" :total="25" :style="{ margin: '100px' }" />
    </Variant>
  </Story>
</template>
