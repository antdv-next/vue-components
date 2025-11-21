import type { Key, VueNode } from '@v-c/util/dist/type'
import type { EditableConfig } from './interface'
import { isEmptyElement } from '@v-c/util/dist/props-util'

/**
 * We trade Map as deps which may change with same value but different ref object.
 * We should make it as hash for deps
 */
export function stringify<K extends PropertyKey, V>(obj: Record<K, V> | Map<K, V>) {
  let tgt: Record<K, V>

  if (obj instanceof Map) {
    tgt = {} as any
    obj.forEach((v, k) => {
      tgt[k] = v
    })
  }
  else {
    tgt = obj
  }

  return JSON.stringify(tgt)
}

export function getRemovable(
  closable?: boolean,
  closeIcon?: VueNode,
  editable?: EditableConfig,
  disabled?: boolean,
) {
  if (
    // Only editable tabs can be removed
    !editable
    // Tabs cannot be removed when disabled
    || disabled
    // closable is false
    || closable === false
    // If closable is undefined, the remove button should be hidden when closeIcon is null or false
    || (closable === undefined && (isEmptyElement(closeIcon) || closeIcon === null))
  ) {
    return false
  }
  return true
}

const VC_TABS_DOUBLE_QUOTE = 'TABS_DQ'

export function genDataNodeKey(key: Key): string {
  return String(key).replace(/"/g, VC_TABS_DOUBLE_QUOTE)
}
