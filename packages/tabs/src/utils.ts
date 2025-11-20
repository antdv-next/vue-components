import type { VueNode } from '@v-c/util/dist/type'
import type { EditableConfig } from './interface'
import { isEmptyElement } from '@v-c/util/dist/props-util'

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
