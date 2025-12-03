import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties } from 'vue'
import type { ComponentsConfig } from '../hooks/useComponents'
import type { DisplayValueType, Mode, RenderNode } from '../interface'
import { defineComponent } from 'vue'

export interface SelectInputProps {
  prefixCls: string
  prefix?: VueNode
  suffix?: VueNode
  clearIcon?: VueNode
  removeIcon?: RenderNode
  multiple?: boolean
  displayValues: DisplayValueType[]
  placeholder?: VueNode
  searchValue?: string
  activeValue?: string
  mode?: Mode
  autoClearSearchValue?: boolean
  onSearch?: (searchText: string, fromTyping: boolean, isCompositing: boolean) => void
  onSearchSubmit?: (searchText: string) => void
  onInputBlur?: () => void
  onClearMouseDown?: (event: MouseEvent) => void
  onInputKeyDown?: (event: KeyboardEvent) => void
  onSelectorRemove?: (value: DisplayValueType) => void
  maxLength?: number
  autoFocus?: boolean
  /** Check if `tokenSeparators` contains `\n` or `\r\n` */
  tokenWithEnter?: boolean
  // Add other props that need to be passed through
  className?: string
  style?: CSSProperties
  focused?: boolean
  components: ComponentsConfig
}

const DEFAULT_OMIT_PROPS = [
  'value',
  'onChange',
  'removeIcon',
  'placeholder',
  'maxTagCount',
  'maxTagTextLength',
  'maxTagPlaceholder',
  'choiceTransitionName',
  'onInputKeyDown',
  'onPopupScroll',
  'tabIndex',
  'activeValue',
  'onSelectorRemove',
  'focused',
] as const

const SelectInput = defineComponent<
  SelectInputProps
>(
  () => {
    return () => {
      return null
    }
  },
)

export default SelectInput
