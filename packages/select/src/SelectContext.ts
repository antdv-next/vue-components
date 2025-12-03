import type { CSSProperties, Ref } from 'vue'
import type { FlattenOptionData, RawValueType, RenderNode } from './interface'
import type {
  BaseOptionType,
  FieldNames,
  OnActiveValue,
  OnInternalSelect,
  PopupSemantic,
  SelectProps,
  SemanticName,
} from './Select'
import { inject, provide, ref } from 'vue'

/**
 * SelectContext is only used for Select. BaseSelect should not consume this context.
 */
export interface SelectContextProps {
  classNames?: Partial<Record<SemanticName, string>> & {
    popup?: Partial<Record<PopupSemantic, string>>
  }
  styles?: Partial<Record<SemanticName, CSSProperties>> & {
    popup?: Partial<Record<PopupSemantic, CSSProperties>>
  }
  options: BaseOptionType[]
  optionRender?: SelectProps['optionRender']
  flattenOptions: FlattenOptionData[]
  onActiveValue: OnActiveValue
  defaultActiveFirstOption?: boolean
  onSelect: OnInternalSelect
  menuItemSelectedIcon?: RenderNode
  rawValues: Set<RawValueType>
  fieldNames?: FieldNames
  virtual?: boolean
  direction?: 'ltr' | 'rtl'
  listHeight?: number
  listItemHeight?: number
  childrenAsData?: boolean
  maxCount?: number
}

const SelectContextKey = Symbol('SelectContext')

function useSelectProvider(value: Ref<SelectContextProps>) {
  provide(SelectContextKey, value)
}

function useSelectContext() {
  return inject(SelectContextKey, ref(null)) as Ref<SelectContextProps | null>
}

export {
  useSelectContext,
  useSelectProvider,
}
