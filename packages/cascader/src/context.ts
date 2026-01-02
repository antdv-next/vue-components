import type { Ref } from 'vue'
import type {
  CascaderProps,
  DefaultOptionType,
  InternalFieldNames,
  SingleValueType,
} from './Cascader'
import { inject, provide, ref } from 'vue'

export interface CascaderContextProps {
  options: NonNullable<CascaderProps['options']>
  fieldNames: InternalFieldNames
  values: SingleValueType[]
  halfValues: SingleValueType[]
  changeOnSelect?: boolean
  onSelect: (valuePath: SingleValueType) => void
  checkable?: boolean | any
  searchOptions: DefaultOptionType[]
  popupPrefixCls?: string
  loadData?: (selectOptions: DefaultOptionType[]) => void
  expandTrigger?: 'hover' | 'click'
  expandIcon?: any
  loadingIcon?: any
  popupMenuColumnStyle?: CascaderProps['popupMenuColumnStyle']
  optionRender?: CascaderProps['optionRender']
  classNames?: CascaderProps['classNames']
  styles?: CascaderProps['styles']
}

const CascaderContextKey = Symbol('CascaderContext')

export function useCascaderProvider(value: Ref<CascaderContextProps>) {
  provide(CascaderContextKey, value)
}

export function useCascaderContext() {
  return inject(CascaderContextKey, ref(null) as any) as Ref<CascaderContextProps | null>
}
