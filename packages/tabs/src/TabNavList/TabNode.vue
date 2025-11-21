<script setup lang="ts">
import type { TabNodeProps } from '../interface'
import { isEmptyElement } from '@v-c/util/dist/props-util'
import RenderComponent from '@v-c/util/dist/RenderComponent.vue'
import { computed, h, onMounted, ref, toRefs, watch } from 'vue'
import { genDataNodeKey, getRemovable } from '../utils'

defineOptions({
  name: 'TabNode',
  inheritAttrs: false,
})

const props = defineProps<TabNodeProps>()

const btnRef = ref<HTMLElement>()
function setBtnRef(el: unknown) {
  btnRef.value = el as HTMLElement
}

const { prefixCls, tab, closable, active, editable, focus } = toRefs(props)

const removable = computed(() => getRemovable(closable.value, tab.value.closeIcon, editable.value, tab.value.disabled))

const tabPrefix = computed(() => `${prefixCls.value}-tab`)

function onInternalClick(e: MouseEvent | KeyboardEvent) {
  if (tab.value.disabled) {
    return
  }
  props.onClick?.(e)
}

const cls = computed(() => [
  tabPrefix.value,
  props.className,
  {
    [`${tabPrefix.value}-with-remove`]: removable.value,
    [`${tabPrefix.value}-active`]: active.value,
    [`${tabPrefix.value}-disabled`]: tab.value.disabled,
    [`${tabPrefix.value}-focus`]: focus.value,
  },
])

function onRemove(event: MouseEvent | KeyboardEvent) {
  event.preventDefault()
  event.stopPropagation()
  editable.value?.onEdit('remove', { key: tab.value.key, event })
}

onMounted(() => {
  watch(() => focus.value, () => {
    if (focus.value && btnRef.value) {
      (btnRef.value).focus()
    }
  }, { immediate: true })
})

const node = computed(() => {
  const btnChildren: any[] = []

  if (focus.value) {
    btnChildren.push(
      h('div', {
        'aria-live': 'polite',
        'style': 'width: 0; height: 0; position: absolute; overflow: hidden; opacity: 0;',
      }, `Tab ${props.currentPosition} of ${props.tabCount}`),
    )
  }

  if (tab.value.icon) {
    btnChildren.push(
      h('span', { class: [`${tabPrefix.value}-icon`] }, [
        h(RenderComponent, { render: tab.value.icon }),
      ]),
    )
  }

  if (tab.value.label) {
    if (typeof tab.value.label === 'string' && !isEmptyElement(tab.value.icon)) {
      btnChildren.push(h('span', {}, tab.value.label))
    }
    else {
      btnChildren.push(tab.value.label)
    }
  }

  const btnNode = h('div', {
    'id': tab.value.id && `${tab.value.id}-tab-${tab.value.key}`,
    'ref': setBtnRef,
    'role': 'tab',
    'aria-selected': active.value,
    'class': [`${tabPrefix.value}-btn`],
    'aria-controls': tab.value.id && `${tab.value.id}-panel-${tab.value.key}`,
    'aria-disabled': tab.value.disabled,
    'tabindex': tab.value.disabled ? undefined : (active.value ? 0 : -1),
    'onClick': (e: any) => {
      e.stopPropagation()
      onInternalClick(e)
    },
    'onKeydown': props.onKeyDown,
    'onMousedown': props.onMouseDown,
    'onMouseup': props.onMouseUp,
    'onFocus': props.onFocus,
    'onBlur': props.onBlur,
  }, btnChildren)

  const children: any[] = [btnNode]

  if (removable.value) {
    children.push(
      h('button', {
        'type': 'button',
        'aria-label': props.removeAriaLabel || 'remove',
        'tabindex': active.value ? 0 : -1,
        'class': [`${tabPrefix.value}-remove`],
        'onClick': (e: any) => {
          e.stopPropagation()
          onRemove(e)
        },
      }, [
        h(RenderComponent, { render: tab.value.closeIcon || (editable.value && editable.value.removeIcon) || '×' }),
      ]),
    )
  }

  return h('div', {
    'key': tab.value.key,
    'data-node-key': genDataNodeKey(tab.value.key),
    'class': cls.value,
    'style': props.style,
    'onClick': onInternalClick,
  }, children)
})

const finalNode = computed(() => props.renderWrapper ? props.renderWrapper(node.value) : node.value)
</script>

<template>
  <RenderComponent :render="finalNode" />
</template>
