<script setup lang="ts">
import type { CSSProperties, VNodeChild } from 'vue'
import type { MoreProps, OperationNodeProps } from '../interface'
import DropDown from '@v-c/dropdown'
import Menu from '@v-c/menu'
import { clsx } from '@v-c/util'
import KeyCode from '@v-c/util/dist/KeyCode'
import RenderComponent from '@v-c/util/dist/RenderComponent'
import { computed, h, ref, toRefs, useTemplateRef, watch } from 'vue'
import { getRemovable } from '../utils'
import AddButton from './AddButton.vue'

const props = withDefaults(defineProps<OperationNodeProps>(), {
  more: () => ({}) as MoreProps,
})

const MenuItem = Menu.Item

const { more: moreProps, tabBarGutter, getPopupContainer, popupStyle, popupClassName, rtl, removeAriaLabel, onTabClick, locale, mobile, id, prefixCls, editable, style, className } = toRefs(props)

const open = ref(false)
const selectedKey = ref<string | null>(null)
const operationNodeRef = useTemplateRef<HTMLDivElement>('operationNodeRef')

const popupId = computed(() => `${id.value}-more-popup`)
const dropdownPrefix = computed(() => `${prefixCls.value}-dropdown`)
const selectedItemId = computed(() => selectedKey.value !== null ? `${popupId.value}-${selectedKey.value}` : null)
const dropdownAriaLabel = computed(() => locale.value?.dropdownAriaLabel)

function onRemoveTab(event: MouseEvent | KeyboardEvent, key: string) {
  event.preventDefault()
  event.stopPropagation()

  editable.value && editable.value.onEdit('remove', { key, event })
}

const menuNode = computed(() => {
  return h(Menu, {
    'prefixCls': `${dropdownPrefix.value}-menu`,
    'id': popupId.value,
    'tabIndex': -1,
    'role': 'listbox',
    'aria-activedescendant': selectedItemId.value,
    'selectedKeys': selectedKey.value ? [selectedKey.value] : undefined,
    'aria-label': dropdownAriaLabel.value !== undefined ? dropdownAriaLabel.value : 'expanded dropdown',
    'onClick': ({ key, domEvent }: { key: string, domEvent: MouseEvent | KeyboardEvent }) => {
      onTabClick.value?.(key, domEvent)
      open.value = false
    },
  }, props.tabs.map((tab) => {
    const { closable, closeIcon, disabled, key, label } = tab
    const removable = getRemovable(closable, closeIcon, editable.value, disabled)
    return h(MenuItem, {
      'key': key,
      'id': `${popupId.value}-${key}`,
      'role': 'option',
      'aria-controls': id.value && `${id.value}-panel-${key}`,
      'disabled': disabled,
    }, [
      h('span', {}, [label as VNodeChild]),
      removable
        ? h('button', {
            'type': 'button',
            'aria-label': removeAriaLabel.value || 'remove',
            'tabIndex': 0,
            'class': className.value,
            'onClick': (e: MouseEvent | KeyboardEvent) => {
              e.stopPropagation()
              onRemoveTab(e, key)
            },
          }, [(closeIcon || editable.value || '×') as VNodeChild])
        : null,
    ])
  }))
})

const overlayClassName = computed(() => {
  return clsx({
    [popupClassName.value!]: popupClassName.value,
    [`${dropdownPrefix.value}-rtl`]: rtl.value,
  })
})

const moreIconNode = computed(() => moreProps.value?.icon || 'More')

const moreStyle = computed(() => {
  const style: CSSProperties = {
    marginInlineStart: tabBarGutter.value ? `${tabBarGutter.value}px` : '0px',
  }
  if (!props.tabs.length) {
    style.visibility = 'hidden'
    style.order = 1
  }

  return style
})

function selectOffset(offset: -1 | 1) {
  const enabledTabs = props.tabs.filter(tab => !tab.disabled)
  let selectedIndex = enabledTabs.findIndex(tab => tab.key === selectedKey.value) || 0
  const len = enabledTabs.length

  for (let i = 0; i < len; i += 1) {
    selectedIndex = (selectedIndex + offset + len) % len
    const tab = enabledTabs[selectedIndex]
    if (!tab.disabled) {
      selectedKey.value = tab.key
      return
    }
  }
}

function onKeyDown(e: KeyboardEvent) {
  const { which } = e

  if (!open.value) {
    if ([KeyCode.DOWN, KeyCode.SPACE, KeyCode.ENTER].includes(which)) {
      open.value = true
      e.preventDefault()
    }
    return
  }

  switch (which) {
    case KeyCode.UP:
      selectOffset(-1)
      e.preventDefault()
      break
    case KeyCode.DOWN:
      selectOffset(1)
      e.preventDefault()
      break
    case KeyCode.ESC:
      open.value = false

      break
    case KeyCode.SPACE:
    case KeyCode.ENTER:
      if (selectedKey.value !== null) {
        onTabClick.value?.(selectedKey.value, e)
      }
      break
  }
}

watch(() => open.value, (visible) => {
  if (!visible) {
    selectedKey.value = null
  }
})

watch([() => selectedItemId.value, () => selectedKey.value], () => {
  if (selectedItemId.value) {
    const ele = document.getElementById(selectedItemId.value)
    if (ele?.scrollIntoView) {
      ele.scrollIntoView(false)
    }
  }
})

defineExpose({
  operationNodeRef,
})
</script>

<template>
  <div ref="operationNodeRef" :class="[`${prefixCls}-nav-operations`, className]" :style="style">
    <DropDown
      v-if="!mobile"
      :prefix-cls="dropdownPrefix"
      :overlay="menuNode"
      :visible="tabs.length ? open : false"
      :overlay-class-name="overlayClassName"
      :overlay-style="popupStyle"
      :mouse-enter-delay="0.1"
      :mouse-leave-delay="0.1"
      :get-popup-container="getPopupContainer"
      v-bind="moreProps"
      @visible-change="open = $event"
    >
      <button
        :id="`${id}-more`"
        type="button"
        :class="`${prefixCls}-nav-more`"
        :style="moreStyle"
        aria-haspopup="listbox"
        :aria-controls="popupId"
        :aria-expanded="open"
        @keydown="{ onKeyDown }"
      >
        <RenderComponent :render="moreIconNode" />
      </button>
    </Dropdown>
    <AddButton :prefix-cls="prefixCls" :locale="locale" :editable="editable" />
  </div>
</template>
