import type { Ref } from 'vue'
import { computed, shallowRef } from 'vue'

// ============================= Types =============================
/** Focus event source. / 焦点事件来源。 */
export type FocusSource = 'input' | 'panel'

/** Focus event handler. / 聚焦事件处理函数。 */
export type FieldFocusHandler = (
  index: number,
  source: FocusSource,
  event: FocusEvent,
) => void

/** Blur event handler. / 失焦事件处理函数。 */
export type FieldBlurHandler = (
  index: number,
  source: FocusSource,
  event: FocusEvent,
) => void

/** Check whether an element belongs to the current focus scope. / 检查元素是否属于当前焦点范围。 */
export type IsInternalElement = (element: EventTarget | null) => boolean

/** Notify a Picker focus or blur event. / 通知 Picker 的聚焦或失焦事件。 */
export type FocusEventHandler = (index: number, event: FocusEvent) => void

export type UseFocusEventsReturn = [
  focused: Ref<boolean>,
  onFieldFocus: FieldFocusHandler,
  onFieldBlur: FieldBlurHandler,
]

// ============================= Utils =============================
/** Check whether the target belongs to any container. / 判断目标是否属于任意一个容器。 */
export function isTargetInContainers(
  target: EventTarget | null,
  containers: readonly (Element | null | undefined)[],
) {
  return containers.some(
    container => !!container && (container === target || container.contains(target as Node)),
  )
}

/**
 * Handle field focus and blur events.
 * 处理 field 的聚焦与失焦事件。
 *
 * Always forward the actual element focus events. Only the internal Picker
 * blur is skipped when `relatedTarget` still belongs to the Picker.
 * 始终转发元素实际发生的焦点事件。仅当 `relatedTarget` 仍属于 Picker 时，
 * 跳过 Picker 内部的整体失焦逻辑。
 */
export default function useFocusEvents(
  isInternalElement: IsInternalElement,
  onFocus?: FocusEventHandler,
  onBlur?: FocusEventHandler,
  onConfirmedBlur?: FocusEventHandler,
): UseFocusEventsReturn {
  // Keep the actual focused field so `useFocusLock` has a reactive signal it
  // can use to correct a switch that is not allowed.
  // 记录实际获得焦点的 field，使 `useFocusLock` 能据此纠正不允许的切换。
  const focusedIndex = shallowRef<number | null>(null)

  const onFieldFocus: FieldFocusHandler = (index, _source, event) => {
    focusedIndex.value = index
    onFocus?.(index, event)
  }

  const onFieldBlur: FieldBlurHandler = (index, _source, event) => {
    if (!isInternalElement(event.relatedTarget)) {
      focusedIndex.value = null
      onConfirmedBlur?.(index, event)
    }

    onBlur?.(index, event)
  }

  return [computed(() => focusedIndex.value !== null), onFieldFocus, onFieldBlur]
}
