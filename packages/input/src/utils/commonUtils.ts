import { Fragment } from 'vue'

export function isEmptyElement(c: any) {
  return (
    c
    && (c.type === Comment
      || (c.type === Fragment && c.children.length === 0)
      || (c.type === Text && c.children.trim() === ''))
  )
}
export function filterEmpty(children = []) {
  const res: any[] = []
  children.forEach((child: any) => {
    if (Array.isArray(child))
      res.push(...child)
    else if (child?.type === Fragment)
      res.push(...filterEmpty(child.children))
    else
      res.push(child)
  })
  return res.filter(c => !isEmptyElement(c))
}
function isValid(value: any) {
  return (
    value !== undefined
    && value !== null
    && (Array.isArray(value) ? filterEmpty(value as any).length : true)
  )
}

export function hasPrefixSuffix(propsAndSlots: any) {
  return (
    isValid(propsAndSlots.prefix)
    || isValid(propsAndSlots.suffix)
    || isValid(propsAndSlots.allowClear)
  )
}

export function hasAddon(propsAndSlots: any) {
  return isValid(propsAndSlots.addonBefore) || isValid(propsAndSlots.addonAfter)
}

export function fixControlledValue(value: string | number) {
  if (typeof value === 'undefined' || value === null)
    return ''

  return String(value)
}

export function resolveOnChange(
  target: HTMLInputElement,
  e: Event,
  onChange: Function,
  targetValue?: string,
) {
  if (!onChange)
    return
  const event: any = e

  if (e.type === 'click') {
    Object.defineProperty(event, 'target', {
      writable: true,
    })
    Object.defineProperty(event, 'currentTarget', {
      writable: true,
    })
    // click clear icon
    // event = Object.create(e);
    const currentTarget = target.cloneNode(true)

    event.target = currentTarget
    event.currentTarget = currentTarget;
    // change target ref value cause e.target.value should be '' when clear input
    (currentTarget as any).value = ''
    onChange(event)
    return
  }
  // Trigger by composition event, this means we need force change the input value
  if (targetValue !== undefined) {
    Object.defineProperty(event, 'target', {
      writable: true,
    })
    Object.defineProperty(event, 'currentTarget', {
      writable: true,
    })
    event.target = target
    event.currentTarget = target
    target.value = targetValue
    onChange(event)
    return
  }
  onChange(event)
}
export interface InputFocusOptions extends FocusOptions {
  cursor?: 'start' | 'end' | 'all'
}

export function triggerFocus(
  element?: HTMLInputElement | HTMLTextAreaElement,
  option?: InputFocusOptions,
) {
  if (!element)
    return

  element.focus(option)

  // Selection content
  const { cursor } = option || {}
  if (cursor) {
    const len = element.value.length

    switch (cursor) {
      case 'start':
        element.setSelectionRange(0, 0)
        break

      case 'end':
        element.setSelectionRange(len, len)
        break

      default:
        element.setSelectionRange(0, len)
    }
  }
}
