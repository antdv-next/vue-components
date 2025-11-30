import type { ComputedRef, CSSProperties, InjectionKey } from 'vue'
import type { RawValueType, RenderNode } from './BaseSelect'
import type { FlattenOptionData } from './interface'
import type {
  BaseOptionType,
  FieldNames,
  OnActiveValue,
  OnInternalSelect,
  PopupSemantic,
  SelectProps,
  SemanticName,
} from './Select'
import { computed, inject, provide } from 'vue'

export interface SelectContextProps {
  classNames?: Partial<Record<SemanticName, string>> & {
    popup?: Partial<Record<PopupSemantic, string>>
  }
  styles?: Partial<Record<SemanticName, CSSProperties>> & {
    popup?: Partial<Record<PopupSemantic, CSSProperties>>
  }
  options: BaseOptionType[]
  optionRender?: SelectProps['optionRender']
  flattenOptions: FlattenOptionData<BaseOptionType>[]
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

const SelectContextKey: InjectionKey<ComputedRef<SelectContextProps>> = Symbol('SelectContextKey')

export function useProvideSelectContext(value: ComputedRef<SelectContextProps>) {
  provide(SelectContextKey, value)
}

export default function useSelectContext() {
  const context = inject(SelectContextKey, null)
  return computed(() => context?.value)
}
