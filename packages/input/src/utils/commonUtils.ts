import type { BaseInputProps, InputProps } from '../interface'
import { triggerFocus as rcTriggerFocus } from '@v-c/util/dist/Dom/focus'

function createPatchedTarget<
  E extends HTMLInputElement | HTMLTextAreaElement,
>(target: E, value: any): E {
  const patched = target.cloneNode(true) as E
  patched.value = value

  if (typeof target.selectionStart === 'number' && typeof target.selectionEnd === 'number') {
    patched.selectionStart = target.selectionStart
    patched.selectionEnd = target.selectionEnd
  }

  // 保持外部 setSelectionRange 仍然作用在真实 target 上
  patched.setSelectionRange = (start, end, direction) => {
    target.setSelectionRange(start, end, direction as any)
  }

  return patched
}

function buildSafeEvent<
  EventType extends Event,
  Element extends HTMLInputElement | HTMLTextAreaElement,
>(event: EventType, target: Element): EventType {
  const safeEvent: any = {
    type: (event as any)?.type,
    timeStamp: (event as any)?.timeStamp,
    bubbles: (event as any)?.bubbles,
    cancelable: (event as any)?.cancelable,
    composed: (event as any)?.composed,

    target,
    currentTarget: target,

    preventDefault: (event as any)?.preventDefault
      ? (event as any).preventDefault.bind(event)
      : undefined,
    stopPropagation: (event as any)?.stopPropagation
      ? (event as any).stopPropagation.bind(event)
      : undefined,
    stopImmediatePropagation: (event as any)?.stopImmediatePropagation
      ? (event as any).stopImmediatePropagation.bind(event)
      : undefined,

    nativeEvent: event,
  }

  return safeEvent as EventType
}

// 需要修改 value 时，克隆一个带有新 value 的 target（detached），避免污染真实节点
function cloneEvent<
  EventType extends Event,
  Element extends HTMLInputElement | HTMLTextAreaElement,
>(event: EventType, target: Element, value: any): EventType {
  const patchedTarget = createPatchedTarget(target, value)
  return buildSafeEvent(event, patchedTarget)
}

// value 无需修改时，保持真实 target 挂载，避免使用 detached clone
// https://github.com/react-component/input/pull/175
function cloneEventWithTarget<
  EventType extends Event,
  Element extends HTMLInputElement | HTMLTextAreaElement,
>(event: EventType, target: Element): EventType {
  return buildSafeEvent(event, target)
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
  if (!onChange)
    return

  if ((e as any)?.type === 'click') {
    onChange(cloneEvent(e as any, target, ''))
    return
  }

  if (target.type !== 'file' && targetValue !== undefined) {
    if (target.value !== targetValue) {
      onChange(cloneEvent(e as any, target, targetValue))
    }
    else {
      onChange(cloneEventWithTarget(e as any, target))
    }
    return
  }

  onChange(e)
}

export const triggerFocus = rcTriggerFocus
