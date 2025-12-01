import type { VueNode } from '@v-c/util/dist/type'
import type { ScrollConfig } from '@v-c/virtual-list'
import type {
  DisplayInfoType,
  DisplayValueType,
  Mode,
  Placement,
  RawValueType,
  RenderDOMFunc,
  RenderNode,
} from '../interface'

export type BaseSelectSemanticName = 'prefix'
  | 'suffix'
  | 'input'
  | 'clear'
  | 'placeholder'
  | 'content'
  | 'item'
  | 'itemContent'
  | 'itemRemove'

/**
 * ZombieJ:
 * We are currently refactoring the semantic structure of the component. Changelog:
 * - Remove `suffixIcon` and change to `suffix`.
 * - Add `components.root` for replacing response element.
 *   - Remove `getInputElement` and `getRawInputElement` since we can use `components.input` instead.
 */

export type {
  DisplayInfoType,
  DisplayValueType,
  Mode,
  Placement,
  RawValueType,
  RenderDOMFunc,
  RenderNode,
}

export interface RefOptionListProps {
  onKeyDown: (event: KeyboardEvent) => void
  onKeyUp: (event: KeyboardEvent) => void
  scrollTo: (args: number | ScrollConfig) => void
}

export interface CustomTagProps {
  label: VueNode
  value: any
  disabled: boolean
  onClose: (event?: MouseEvent) => void
  closable: boolean
  isMaxTag: boolean
  index: number
}

export interface BaseSelectRef {
  focus: (options?: FocusOptions) => void
  blur: () => void
  scrollTo: ScrollTo
  nativeElement: HTMLElement
}
