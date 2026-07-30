import type { Ref } from 'vue'
import { onUpdated, watch } from 'vue'
import { isTargetInContainers } from './useFocusEvents'

interface FocusLockSelectorRef {
  startInput?: HTMLElement | null
  endInput?: HTMLElement | null
  focus: (index?: number | { index?: number }) => void
}

/**
 * Keep focus on the specified input field while focus moves inside the Picker.
 * 当焦点在 Picker 内移动时，将其锁定在指定的输入框上。
 */
export default function useFocusLock(
  index: Ref<number | null>,
  forceFocus: Ref<boolean>,
  selectorRef: Ref<FocusLockSelectorRef | undefined>,
  popupRef: Ref<HTMLElement | undefined | null>,
  triggerOpen: (open: boolean) => void,
) {
  // Only a strong transition actively opens the Picker and moves DOM focus.
  // Weak transitions keep the expected index without stealing external focus.
  // 仅强切换会主动打开 Picker 并移动 DOM 焦点；弱切换只保留预期 index，
  // 不抢占外部元素的焦点。
  watch(
    [index, forceFocus],
    () => {
      if (index.value !== null && forceFocus.value) {
        triggerOpen(true)
        selectorRef.value?.focus({ index: index.value })
      }
    },
    { flush: 'post' },
  )

  // DOM focus may change while `index` stays the same, so check after every
  // update rather than only when `index` does.
  // DOM 焦点变化时 `index` 可能保持不变，因此每次更新后都需要检查。
  const lockFocus = () => {
    if (index.value === null) {
      return
    }

    const inputFields = [selectorRef.value?.startInput, selectorRef.value?.endInput]
    const inputRoot = inputFields[index.value]?.getRootNode() as
      | Document
      | ShadowRoot
      | undefined

    // `document.activeElement` stops at the shadow host. Read from the input's
    // own root first so focus locking can identify the actual field.
    // `document.activeElement` 在 Shadow DOM 中只会返回 host。优先读取 input
    // 所属 root，才能识别实际聚焦的 field。
    const activeElement = inputRoot?.activeElement ?? document.activeElement

    if (isTargetInContainers(activeElement, [popupRef.value])) {
      return
    }

    const focusInOtherField = inputFields.some(
      (field, fieldIndex) =>
        fieldIndex !== index.value && isTargetInContainers(activeElement, [field]),
    )

    if (focusInOtherField) {
      inputFields[index.value]?.focus()
    }
  }

  onUpdated(lockFocus)
}
