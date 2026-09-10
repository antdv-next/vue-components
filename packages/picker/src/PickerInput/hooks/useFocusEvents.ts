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
 * blur is skipped when `relatedTarget` still belongs to the Picker or the
 * focused panel control becomes disabled.
 * 始终转发元素实际发生的焦点事件。当 `relatedTarget` 仍属于 Picker，或面板中
 * 获得焦点的控件变为禁用时，跳过 Picker 的整体失焦逻辑。
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

  const onFieldBlur: FieldBlurHandler = (index, source, event) => {
    // A navigation button (prev / next) that becomes disabled after click
    // drops the focus. Move it back to the panel container so the popup
    // keeps open instead of treating it as an outside blur.
    // 面板中的翻页按钮点击后被禁用会丢失焦点，将焦点交还给面板容器，
    // 避免被视为外部失焦而关闭弹层。
    const isDisabledTarget
      = source === 'panel' && (event.target as HTMLElement | null)?.hasAttribute?.('disabled')

    if (isDisabledTarget) {
      (event.currentTarget as HTMLElement | null)?.focus?.({ preventScroll: true })
    }
    else if (!isInternalElement(event.relatedTarget)) {
      focusedIndex.value = null
      onConfirmedBlur?.(index, event)
    }

    onBlur?.(index, event)
  }

  return [computed(() => focusedIndex.value !== null), onFieldFocus, onFieldBlur]
}
