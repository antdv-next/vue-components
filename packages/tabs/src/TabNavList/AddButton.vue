<script setup lang="ts">
import type { AddButtonProps } from '../interface'
import { ref, toRefs } from 'vue'

defineOptions({
  name: 'AddButton',
  inheritAttrs: false,
})

const props = defineProps<AddButtonProps>()

const { prefixCls, editable, locale, style } = toRefs(props)

const buttonRef = ref<HTMLButtonElement>()

function handleClick(event: MouseEvent) {
  editable.value?.onEdit('add', { event })
}

defineExpose({
  buttonRef,
})
</script>

<template>
  <button
    v-if="editable && editable.showAdd !== false"
    ref="buttonRef"
    type="button"
    :class="`${prefixCls}-nav-add`" :style="style"
    :aria-label="locale?.addAriaLabel || 'Add tab'"
    @click="handleClick"
  >
    {{ editable.addIcon || '+' }}
  </button>
</template>
