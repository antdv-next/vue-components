import type { CSSProperties } from 'vue'
import type { BaseSelectProps, BaseSelectPropsWithoutPrivate, BaseSelectSemanticName, DisplayInfoType, DisplayValueType, RenderNode } from './BaseSelect'
import type { FlattenOptionData } from './interface'
import useId from '@v-c/util/dist/hooks/useId'
import useMergedState from '@v-c/util/dist/hooks/useMergedState'
import omit from '@v-c/util/dist/omit'
import { getAttrStyleAndClass } from '@v-c/util/dist/props-util'
import warning from '@v-c/util/dist/warning'
import { computed, defineComponent, shallowRef, watch } from 'vue'
import BaseSelect, { isMultiple } from './BaseSelect'
import useCache from './hooks/useCache'
import useFilterOptions from './hooks/useFilterOptions'
import useOptions from './hooks/useOptions'
import useRefFunc from './hooks/useRefFunc'
import useSearchConfig from './hooks/useSearchConfig'
import OptGroup from './OptGroup'
import Option from './Option'
import OptionList from './OptionList'
import { useProvideSelectContext } from './SelectContext'
import { hasValue, isComboNoValue, toArray } from './utils/commonUtil'
import { fillFieldNames, flattenOptions, injectPropsWithOption } from './utils/valueUtil'
import warningProps, { warningNullOptions } from './utils/warningPropsUtil'

const OMIT_DOM_PROPS = ['inputValue']

export type OnActiveValue = (
  active: RawValueType,
  index: number,
  info?: { source?: 'keyboard' | 'mouse' },
) => void

export type OnInternalSelect = (value: RawValueType, info: { selected: boolean }) => void

export type RawValueType = string | number
export interface LabelInValueType {
  label: any
  value: RawValueType
}

export type DraftValueType
  = | RawValueType
    | LabelInValueType
    | DisplayValueType
    | (RawValueType | LabelInValueType | DisplayValueType)[]

export type FilterFunc<OptionType> = (inputValue: string, option?: OptionType) => boolean

export interface FieldNames {
  value?: string
  label?: string
  groupLabel?: string
  options?: string
}

export interface BaseOptionType {
  disabled?: boolean
  className?: string
  title?: string
  [name: string]: any
}

export interface DefaultOptionType extends BaseOptionType {
  label?: any
  value?: string | number | null
  children?: Omit<DefaultOptionType, 'children'>[]
}

export type SelectHandler<ValueType, OptionType extends BaseOptionType = DefaultOptionType> = (
  value: ValueType,
  option: OptionType,
) => void

type ArrayElementType<T> = T extends (infer E)[] ? E : T

export type SemanticName = BaseSelectSemanticName
export type PopupSemantic = 'listItem' | 'list'
export interface SearchConfig<OptionType> {
  searchValue?: string
  autoClearSearchValue?: boolean
  onSearch?: (value: string) => void
  filterOption?: boolean | FilterFunc<OptionType>
  filterSort?: (optionA: OptionType, optionB: OptionType, info: { searchValue: string }) => number
  optionFilterProp?: string
}
export interface SelectProps<ValueType = any, OptionType extends BaseOptionType = DefaultOptionType>
/* @vue-ignore */
  extends Omit<BaseSelectPropsWithoutPrivate, 'showSearch'> {
  prefixCls?: string
  id?: string
  backfill?: boolean
  fieldNames?: FieldNames
  onSearch?: SearchConfig<OptionType>['onSearch']
  showSearch?: boolean | SearchConfig<OptionType>
  searchValue?: SearchConfig<OptionType>['searchValue']
  autoClearSearchValue?: boolean
  onSelect?: SelectHandler<ArrayElementType<ValueType>, OptionType>
  onDeselect?: SelectHandler<ArrayElementType<ValueType>, OptionType>
  onActive?: (value: ValueType) => void
  filterOption?: SearchConfig<OptionType>['filterOption']
  filterSort?: SearchConfig<OptionType>['filterSort']
  optionFilterProp?: string
  optionLabelProp?: string
  children?: any
  options?: OptionType[]
  optionRender?: (oriOption: FlattenOptionData<OptionType>, info: { index: number }) => any
  defaultActiveFirstOption?: boolean
  virtual?: boolean
  direction?: 'ltr' | 'rtl'
  listHeight?: number
  listItemHeight?: number
  labelRender?: (props: LabelInValueType) => any
  menuItemSelectedIcon?: RenderNode
  mode?: 'combobox' | 'multiple' | 'tags'
  labelInValue?: boolean
  value?: ValueType | null
  defaultValue?: ValueType | null
  maxCount?: number
  onChange?: (value: ValueType, option?: OptionType | OptionType[]) => void
  classNames?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, CSSProperties>>
}

function isRawValue(value: DraftValueType): value is RawValueType {
  return !value || typeof value !== 'object'
}

const omitKeys: string[] = [
  'id',
  'mode',
  'prefixCls',
  'backfill',
  'fieldNames',
  'showSearch',
  'searchValue',
  'onSearch',
  'autoClearSearchValue',
  'filterOption',
  'optionFilterProp',
  'filterSort',
  'onSelect',
  'onDeselect',
  'onActive',
  'popupMatchSelectWidth',
  'optionLabelProp',
  'options',
  'optionRender',
  'defaultActiveFirstOption',
  'menuItemSelectedIcon',
  'virtual',
  'direction',
  'listHeight',
  'listItemHeight',
  'labelRender',
  'value',
  'defaultValue',
  'labelInValue',
  'onChange',
  'maxCount',
  'classNames',
  'styles',
]

const defaults: SelectProps = {
  popupMatchSelectWidth: true,
  listHeight: 200,
  listItemHeight: 20,
  prefixCls: 'vc-select',
}

const Select = defineComponent<
  SelectProps
>(
  (props = defaults, { slots, expose, attrs }) => {
    const mergedId = useId(props.id)
    const multiple = computed(() => isMultiple(props.mode as any))
    const childrenNodes = computed(() => props.children ?? slots.default?.())
    const searchProps = computed(() => ({
      searchValue: props.searchValue,
      onSearch: props.onSearch,
      autoClearSearchValue: props.autoClearSearchValue,
      filterOption: props.filterOption,
      optionFilterProp: props.optionFilterProp,
      filterSort: props.filterSort,
    }))
    const popupMatchSelectWidth = computed(() =>
      props.popupMatchSelectWidth === undefined ? true : props.popupMatchSelectWidth,
    )
    const searchConfig = useSearchConfig(
      () => props.showSearch as any,
      () => searchProps.value as any,
      () => props.mode,
    )
    const mergedShowSearch = computed(() => searchConfig.value[0])
    const searchConfigValue = computed(() => searchConfig.value[1])
    const filterOption = computed(() => searchConfigValue.value.filterOption)
    const searchValue = computed(() => searchConfigValue.value.searchValue)
    const optionFilterProp = computed(() => searchConfigValue.value.optionFilterProp)
    const filterSort = computed(() => searchConfigValue.value.filterSort)
    const onSearch = computed(() => searchConfigValue.value.onSearch)
    const autoClearSearchValue = computed(
      () => searchConfigValue.value.autoClearSearchValue ?? true,
    )

    const mergedFilterOption = computed(() => {
      if (filterOption.value === undefined && props.mode === 'combobox') {
        return false
      }
      return filterOption.value
    })

    const mergedFieldNames = computed(() => fillFieldNames(props.fieldNames, !!childrenNodes.value))

    const [internalSearchValue, setSearchValue] = useMergedState('', {
      value: searchValue as any,
      defaultValue: props.defaultValue,
    })
    const mergedSearchValue = computed(() => internalSearchValue.value || '')

    const parsedOptions = useOptions(
      () => props.options as any,
      () => childrenNodes.value,
      () => mergedFieldNames.value,
      () => optionFilterProp.value as any,
      () => props.optionLabelProp!,
    )
    const valueOptions = computed(() => parsedOptions.value.valueOptions)
    const labelOptions = computed(() => parsedOptions.value.labelOptions)
    const mergedOptions = computed(() => parsedOptions.value.options as DefaultOptionType[])

    const convert2LabelValues = useRefFunc((draftValues: DraftValueType) => {
      const valueList = toArray(draftValues)
      return valueList.map((val) => {
        let rawValue: RawValueType
        let rawLabel: any
        let rawDisabled: boolean | undefined
        let rawTitle: string

        if (isRawValue(val)) {
          rawValue = val as any
        }
        else {
          rawLabel = (val as LabelInValueType).label
          rawValue = (val as LabelInValueType).value
        }

        const option = valueOptions.value.get(rawValue)
        if (option) {
          if (rawLabel === undefined)
            rawLabel = (option as any)?.[props.optionLabelProp || mergedFieldNames.value.label]
          rawDisabled = (option as any)?.disabled
          rawTitle = (option as any)?.title

          if (process.env.NODE_ENV !== 'production' && !props.optionLabelProp) {
            const optionLabel = (option as any)?.[mergedFieldNames.value.label]
            if (
              optionLabel !== undefined
              && optionLabel !== rawLabel
            ) {
              warning(false, '`label` of `value` is not same as `label` in Select options.')
            }
          }
        }

        return {
          label: rawLabel,
          value: rawValue,
          key: rawValue,
          disabled: rawDisabled,
          title: rawTitle!,
        }
      })
    })

    const [internalValue, setInternalValue] = useMergedState<any>(props.defaultValue as any, {
      value: computed(() => props.value as any) as any,
      defaultValue: props.defaultValue,
    })

    const rawLabeledValues = computed(() => {
      const newInternalValue = multiple.value && internalValue.value === null ? [] : internalValue.value
      const values = convert2LabelValues(newInternalValue)
      if (props.mode === 'combobox' && isComboNoValue(values[0]?.value)) {
        return []
      }
      return values
    })

    const [mergedValues, getMixedOption] = useCache(
      () => rawLabeledValues.value as any,
      () => valueOptions.value as any,
    )

    const displayValues = computed(() => {
      if (!props.mode && mergedValues.value.length === 1) {
        const firstValue = mergedValues.value[0]
        if (firstValue.value === null && (firstValue.label === null || firstValue.label === undefined)) {
          return []
        }
      }
      return mergedValues.value.map((item: any) => ({
        ...item,
        label:
        (typeof props.labelRender === 'function' ? props.labelRender(item) : item.label)
        ?? item.value,
      }))
    })

    const rawValues = computed(() => new Set(mergedValues.value.map((val: any) => val.value)))

    watch(
      () => mergedValues.value,
      (next) => {
        if (props.mode === 'combobox') {
          const strValue = next?.[0]?.value
          setSearchValue(hasValue(strValue) ? String(strValue) : '')
        }
      },
      { immediate: true },
    )

    const createTagOption = useRefFunc((val: RawValueType, label?: any) => {
      const mergedLabel = label ?? val
      return {
        [mergedFieldNames.value.value]: val,
        [mergedFieldNames.value.label]: mergedLabel,
      } as DefaultOptionType
    })

    const filledTagOptions = computed(() => {
      if (props.mode !== 'tags') {
        return mergedOptions.value
      }
      const cloneOptions = [...mergedOptions.value]
      const existOptions = (val: RawValueType) => valueOptions.value.has(val)
    ;[...mergedValues.value]
        .sort((a: any, b: any) => (a.value < b.value ? -1 : 1))
        .forEach((item: any) => {
          const val = item.value
          if (!existOptions(val)) {
            cloneOptions.push(createTagOption(val, item.label))
          }
        })
      return cloneOptions
    })

    const filteredOptions = useFilterOptions(
      () => filledTagOptions.value as any,
      () => mergedFieldNames.value,
      () => mergedSearchValue.value,
      () => mergedFilterOption.value as any,
      () => optionFilterProp.value as any,
    )

    const filledSearchOptions = computed(() => {
      if (
        props.mode !== 'tags'
        || !mergedSearchValue.value
        || filteredOptions.value.some(
          (item: any) => item[optionFilterProp.value || 'value'] === mergedSearchValue.value,
        )
      ) {
        return filteredOptions.value
      }
      if (
        filteredOptions.value.some(
          (item: any) => item[mergedFieldNames.value.value] === mergedSearchValue.value,
        )
      ) {
        return filteredOptions.value
      }
      return [createTagOption(mergedSearchValue.value), ...filteredOptions.value]
    })

    const sorter = (inputOptions: DefaultOptionType[]) => {
      const sortedOptions = [...inputOptions].sort((a, b) =>
        (filterSort.value as any)(a, b, { searchValue: mergedSearchValue.value }),
      )
      return (sortedOptions as any).map((item: DefaultOptionType) => {
        if (Array.isArray((item as any).options)) {
          return {
            ...item,
            options: (item as any).options.length > 0 ? sorter((item as any).options) : (item as any).options,
          } as DefaultOptionType
        }
        return item as DefaultOptionType
      }) as DefaultOptionType[]
    }

    const orderedFilteredOptions = computed(() => {
      if (!filterSort.value) {
        return filledSearchOptions.value
      }
      return sorter(filledSearchOptions.value as any)
    })

    const displayOptions = computed(() =>
      flattenOptions(orderedFilteredOptions.value, {
        fieldNames: mergedFieldNames.value,
        childrenAsData: !!childrenNodes.value,
      }),
    )

    const triggerChange = (values: DraftValueType) => {
      const labeledValues = convert2LabelValues(values)
      setInternalValue(labeledValues as any)

      if (
        props.onChange
        && (labeledValues.length !== mergedValues.value.length
          || labeledValues.some((newVal: any, index: number) => mergedValues.value[index]?.value !== newVal?.value))
      ) {
        const returnValues = props.labelInValue
          ? labeledValues.map(({ label: l, value: v }) => ({ label: l, value: v }))
          : labeledValues.map((v: any) => v.value)

        const returnOptions = labeledValues.map((v: any) =>
          injectPropsWithOption(getMixedOption(v.value) as any),
        )

        props.onChange(
          multiple.value ? (returnValues as any) : (returnValues as any)[0],
          multiple.value ? (returnOptions as any) : (returnOptions as any)[0],
        )
      }
    }

    const activeValue = shallowRef<string>(null as any)
    const accessibilityIndex = shallowRef(0)
    const mergedDefaultActiveFirstOption = computed(() =>
      props.defaultActiveFirstOption !== undefined ? props.defaultActiveFirstOption : props.mode !== 'combobox',
    )

    const activeEventRef = shallowRef<Promise<void>>()

    const onActiveValue: OnActiveValue = (active, index, { source = 'keyboard' } = {}) => {
      accessibilityIndex.value = index
      if (props.backfill && props.mode === 'combobox' && active !== null && source === 'keyboard') {
        activeValue.value = String(active)
      }
      const promise = Promise.resolve().then(() => {
        if (activeEventRef.value === promise) {
          props.onActive?.(active as any)
        }
      })
      activeEventRef.value = promise
    }

    const triggerSelect = (val: RawValueType, selected: boolean, type?: DisplayInfoType) => {
      const getSelectEnt = (): [RawValueType | LabelInValueType, DefaultOptionType] => {
        const option = getMixedOption(val)
        return [
          props.labelInValue
            ? {
                label: option?.[mergedFieldNames.value.label],
                value: val,
              }
            : val,
          injectPropsWithOption(option as any),
        ]
      }

      if (selected && props.onSelect) {
        const [wrappedValue, option] = getSelectEnt()
        props.onSelect(wrappedValue as any, option as any)
      }
      else if (!selected && props.onDeselect && type !== 'clear') {
        const [wrappedValue, option] = getSelectEnt()
        props.onDeselect(wrappedValue as any, option as any)
      }
    }

    const onInternalSelect = useRefFunc<OnInternalSelect>((val, info) => {
      let cloneValues: any[]
      const mergedSelect = multiple.value ? info.selected : true
      if (mergedSelect) {
        cloneValues = multiple.value ? [...mergedValues.value, val] : [val]
      }
      else {
        cloneValues = mergedValues.value.filter((v: any) => v.value !== val)
      }
      triggerChange(cloneValues)
      triggerSelect(val, mergedSelect)
      if (props.mode === 'combobox') {
        activeValue.value = ''
      }
      else if (!multiple.value || autoClearSearchValue.value) {
        setSearchValue('')
        activeValue.value = ''
      }
    })

    const onDisplayValuesChange: BaseSelectProps['onDisplayValuesChange'] = (nextValues, info) => {
      triggerChange(nextValues as any)
      const { type, values } = info
      if (type === 'remove' || type === 'clear') {
        values.forEach((item) => {
          triggerSelect(item.value as any, false, type)
        })
      }
    }

    const onInternalSearch: BaseSelectProps['onSearch'] = (searchText, info) => {
      setSearchValue(searchText)
      activeValue.value = null as any
      if (info.source === 'submit') {
        const formatted = (searchText || '').trim()
        if (formatted) {
          const newRawValues = Array.from(new Set<RawValueType>([...rawValues.value, formatted]))
          triggerChange(newRawValues)
          triggerSelect(formatted, true)
          setSearchValue('')
        }
        return
      }
      if (info.source !== 'blur') {
        if (props.mode === 'combobox') {
          triggerChange(searchText)
        }
        onSearch.value?.(searchText)
      }
    }

    const onInternalSearchSplit: BaseSelectProps['onSearchSplit'] = (words) => {
      let patchValues: RawValueType[] = words
      if (props.mode !== 'tags') {
        patchValues = (words as any)
          .map((word: any) => {
            const opt = labelOptions.value.get(word)
            return opt?.value
          })
          .filter((val: any) => val !== undefined)
      }
      const newRawValues = Array.from(new Set<RawValueType>([...rawValues.value, ...patchValues]))
      triggerChange(newRawValues)
      newRawValues.forEach((newRawValue) => {
        triggerSelect(newRawValue, true)
      })
    }

    const selectContext = computed(() => {
      const realVirtual = props.virtual !== false && popupMatchSelectWidth.value !== false
      return {
        ...parsedOptions.value,
        flattenOptions: displayOptions.value,
        onActiveValue,
        defaultActiveFirstOption: mergedDefaultActiveFirstOption.value,
        onSelect: onInternalSelect,
        menuItemSelectedIcon: props.menuItemSelectedIcon,
        rawValues: rawValues.value,
        fieldNames: mergedFieldNames.value,
        virtual: realVirtual,
        direction: props.direction,
        listHeight: props.listHeight ?? 200,
        listItemHeight: props.listItemHeight ?? 20,
        childrenAsData: !!childrenNodes.value,
        maxCount: props.maxCount,
        optionRender: props.optionRender,
        classNames: props.classNames,
        styles: props.styles,
      }
    })

    useProvideSelectContext(selectContext as any)

    if (process.env.NODE_ENV !== 'production') {
      warningProps(props as any)
      warningNullOptions(mergedOptions.value as any, mergedFieldNames.value)
    }

    expose({
      focus: () => {},
    })

    return () => {
      const { restAttrs } = getAttrStyleAndClass(attrs)
      const restProps = omit(props, omitKeys as any)
      return (
        <BaseSelect
          {...restAttrs}
          {...restProps}
          id={mergedId}
          prefixCls={props.prefixCls ?? 'vc-select'}
          omitDomProps={OMIT_DOM_PROPS as any}
          mode={props.mode as any}
          classNames={props.classNames}
          styles={props.styles}
          displayValues={displayValues.value as any}
          onDisplayValuesChange={onDisplayValuesChange}
          maxCount={props.maxCount}
          direction={props.direction}
          showSearch={mergedShowSearch.value}
          searchValue={mergedSearchValue.value}
          onSearch={onInternalSearch}
          autoClearSearchValue={autoClearSearchValue.value}
          onSearchSplit={onInternalSearchSplit}
          popupMatchSelectWidth={popupMatchSelectWidth.value}
          OptionList={OptionList}
          emptyOptions={!displayOptions.value.length}
          activeValue={activeValue.value}
          activeDescendantId={`${mergedId}_list_${accessibilityIndex.value}`}
        />
      )
    }
  },
)

const TypedSelect = Select as unknown as (<
  ValueType = any,
  OptionType extends BaseOptionType | DefaultOptionType = DefaultOptionType,
>(
  props: SelectProps<ValueType, OptionType> & { ref?: any },
) => any) & {
  Option: typeof Option
  OptGroup: typeof OptGroup
}

TypedSelect.Option = Option
TypedSelect.OptGroup = OptGroup

export default TypedSelect
