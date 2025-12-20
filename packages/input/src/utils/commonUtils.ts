import type { BaseInputProps, InputProps } from '../interface'
import { triggerFocus as rcTriggerFocus } from '@v-c/util/dist/Dom/focus'

// TODO: It's better to use `Proxy` replace the `element.value`. But we still need support old browsers.
function cloneEvent<
  EventType extends Event,
  Element extends HTMLInputElement | HTMLTextAreaElement,
>(event: EventType, target: Element, value: any) {
  const currentTarget = target.cloneNode(true) as Element
  currentTarget.value = value

  if (typeof target.selectionStart === 'number' && typeof target.selectionEnd === 'number') {
    currentTarget.selectionStart = target.selectionStart
    currentTarget.selectionEnd = target.selectionEnd
  }

  // 让外部 setSelectionRange 仍然作用在真实 target 上（你原逻辑保留）
  currentTarget.setSelectionRange = (start, end, direction) => {
    target.setSelectionRange(start, end, direction as any)
  }

  const wrapped = new Proxy(event as any, {
    get(obj, key) {
      if (key === 'target' || key === 'currentTarget')
        return currentTarget
      // 关键：用原 event 作为 receiver，保证 getter 的 this 正确
      return Reflect.get(obj, key, obj)
    },
  })

  return wrapped as EventType
}

export function hasAddon(props: BaseInputProps | InputProps) {
  return !!(props.addonBefore || props.addonAfter)
}

export function hasPrefixSuffix(props: BaseInputProps | InputProps) {
  return !!(props.prefix || props.suffix || props.allowClear)
}

export function resolveOnChange<E extends HTMLInputElement | HTMLTextAreaElement>(
  target: E,
  e: Event | MouseEvent | CompositionEvent,
  onChange: undefined | ((event: Event) => void),
  targetValue?: string,
) {
  if (!onChange) {
    return
  }

  let event = e

  if (e.type === 'click') {
    event = cloneEvent(e, target, '')
    onChange(event)
    return
  }

  if (target.type !== 'file' && targetValue !== undefined) {
    event = cloneEvent(e, target, targetValue)
    onChange(event)
    return
  }

  onChange(event)
}

export const triggerFocus = rcTriggerFocus
