<script setup lang="ts">
import type { TabNodeProps } from '../interface'
import { isEmptyElement } from '@v-c/util/dist/props-util'
import RenderComponent from '@v-c/util/dist/RenderComponent.vue'
import { computed, onMounted, toRefs, useTemplateRef, watch } from 'vue'
import { genDataNodeKey, getRemovable } from '../utils'

defineOptions({
  name: 'TabNode',
  inheritAttrs: false,
})

const props = defineProps<TabNodeProps>()

const btnRef = useTemplateRef('btnRef')

const { prefixCls, tab, closable, active, editable, focus } = toRefs(props)

const removable = computed(() => getRemovable(closable.value, tab.value.closeIcon, editable.value, tab.value.disabled))

const tabPrefix = computed(() => `${prefixCls.value}-tab`)

function onInternalClick(e: MouseEvent | KeyboardEvent) {
  if (tab.value.disabled) {
    return
  }
  props.onClick?.(e)
}

const cls = computed(() => {
  return [
    tabPrefix.value,
    props.className,
    {
      [`${tabPrefix.value}-with-remove`]: removable.value,
      [`${tabPrefix.value}-active`]: active.value,
      [`${tabPrefix.value}-disabled`]: tab.value.disabled,
      [`${tabPrefix.value}-focus`]: focus.value,
    },
  ]
})

function onRemove(event: MouseEvent | KeyboardEvent) {
  event.preventDefault()
  event.stopPropagation()
  editable.value?.onEdit('remove', { key: tab.value.key, event })
}

//  const labelNode = React.useMemo<React.ReactNode>(
//     () => (icon && typeof label === 'string' ? <span>{label}</span> : label),
//     [label, icon],
//   );

onMounted(() => {
  watch(() => focus.value, () => {
    if (focus.value && btnRef.value) {
      btnRef.value.focus()
    }
  }, { immediate: true })
})
</script>

<template>
  <div
    :key="tab.key"
    :data-node-key="genDataNodeKey(tab.key)"
    :class="cls"
    :style="style"
    @click="onInternalClick"
  >
    <div
      :id="tab.id && `${tab.id}-tab-${tab.key}`"
      ref="btnRef"
      role="tab"
      :aria-selected="active"
      :class="[`${tabPrefix}-btn`]"
      :aria-controls="tab.id && `${tab.id}-panel-${tab.key}`"
      :aria-disabled="tab.disabled"
      :tabindex="tab.disabled ? undefined : active ? 0 : -1"
      @click="e => {
        e.stopPropagation()
        onInternalClick(e)
      }"
      @keydown="onKeyDown"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
      @focus="onFocus"
      @blur="onBlur"
    >
      <div
        v-if="focus"
        aria-live="polite"
        style="width: 0; height: 0; position: absolute; overflow: hidden; opacity: 0;"
      >
        {{ `Tab ${currentPosition} of ${tabCount}` }}
      </div>

      <span v-if="tab.icon" :class=" [`${tabPrefix}-icon`]">
        <RenderComponent :render="tab.icon" />
      </span>

      <template v-if="tab.label">
        <span v-if="typeof tab.label === 'string' && !isEmptyElement(tab.icon)">
          {{ tab.label }}
        </span>

        <template v-else>
          {{ tab.label }}
        </template>
      </template>
    </div>

    <button v-if="removable">
      <button
        type="button"
        :aria-label="removeAriaLabel || 'remove'"
        :tabindex="active ? 0 : -1"
        :class="[`${tabPrefix}-remove`]"
        @click="e => {
          e.stopPropagation();
          onRemove(e);
        }"
      >
        <RenderComponent :render="tab.closeIcon || editable && editable.removeIcon || '×'" />
      </button>
    </button>
  </div>
</template>
