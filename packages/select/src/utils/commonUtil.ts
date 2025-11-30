import type { DisplayValueType } from '../BaseSelect'

export function toArray<T>(value: T | T[]): T[] {
  if (Array.isArray(value)) {
    return value
  }
  return value !== undefined ? [value] : []
}

export const isClient = typeof window !== 'undefined' && !!window.document?.documentElement

export const isBrowserClient = process.env.NODE_ENV !== 'test' && isClient

export function hasValue(value: any) {
  return value !== undefined && value !== null
}

export function isComboNoValue(value: any) {
  return !value && value !== 0
}

function isTitleType(title: any) {
  return ['string', 'number'].includes(typeof title)
}

export function getTitle(item: DisplayValueType): string {
  let title: string | undefined
  if (item) {
    if (isTitleType(item.title)) {
      title = (item.title as any).toString()
    } else if (isTitleType(item.label)) {
      title = (item.label as any).toString()
    }
  }

  return title as string
}
