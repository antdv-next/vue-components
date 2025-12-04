import type { VueNode } from '@v-c/util/dist/type'
import type { CSSProperties, Ref } from 'vue'
import type {
  BaseSelectProps,
  BaseSelectPropsWithoutPrivate,
  BaseSelectRef,
  BaseSelectSemanticName,
  DisplayInfoType,
} from './BaseSelect'
import type { DisplayValueType, FlattenOptionData, RawValueType, RenderNode } from './interface'
import useId from '@v-c/util/dist/hooks/useId'
import omit from '@v-c/util/dist/omit'
import { filterEmpty } from '@v-c/util/dist/props-util'
import { computed, defineComponent, shallowRef, toRef, watch } from 'vue'
import {
  BaseSelect,
  isMultiple,
} from './BaseSelect'
import useCache from './hooks/useCache'
import useFilterOptions from './hooks/useFilterOptions'
import useOptions from './hooks/useOptions'
import useRefFunc from './hooks/useRefFunc'
import useSearchConfig from './hooks/useSearchConfig'
import OptionList from './OptionList'
import { useSelectProvider } from './SelectContext'
import { hasValue, isComboNoValue, toArray } from './utils/commonUtil'
import { convertChildrenToData } from './utils/legacyUtil.ts'
import { fillFieldNames, flattenOptions, injectPropsWithOption } from './utils/valueUtil'

const OMIT_DOM_PROPS = ['inputValue']

export type OnActiveValue = (
  active: RawValueType | null,
  index: number,
  info?: { source?: 'keyboard' | 'mouse' },
) => void

export type OnInternalSelect = (value: RawValueType, info: { selected: boolean }) => void

export interface LabelInValueType {
  label: VueNode
  value: RawValueType
}

export type DraftValueType
  = | RawValueType
    | LabelInValueType
    | DisplayValueType
    | (RawValueType | LabelInValueType | DisplayValueType)[]

export type FilterFunc = (inputValue: string, option?: any) => boolean

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
  label?: VueNode
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
export interface SearchConfig {
  searchValue?: string
  autoClearSearchValue?: boolean
  onSearch?: (value: string) => void
  filterOption?: boolean | FilterFunc
  filterSort?: (optionA: any, optionB: any, info: { searchValue: string }) => number
  optionFilterProp?: string
}
export interface SelectProps extends Omit<BaseSelectPropsWithoutPrivate, 'showSearch'> {
  prefixCls?: string
  id?: string

  backfill?: boolean

  // >>> Field Names
  fieldNames?: FieldNames
  /**  @deprecated please use  showSearch.onSearch */
  onSearch?: SearchConfig['onSearch']
  showSearch?: boolean | SearchConfig
  /**  @deprecated please use  showSearch.searchValue */
  searchValue?: SearchConfig['searchValue']
  /**  @deprecated please use  showSearch.autoClearSearchValue */
  autoClearSearchValue?: boolean

  // >>> Select
  onSelect?: SelectHandler<ArrayElementType<any>, any>
  onDeselect?: SelectHandler<ArrayElementType<any>, any>
  onActive?: (value: any) => void

  // >>> Options
  /**
   * In Select, `false` means do nothing.
   * In TreeSelect, `false` will highlight match item.
   * It's by design.
   */
  /**  @deprecated please use  showSearch.filterOption */
  filterOption?: SearchConfig['filterOption']
  /**  @deprecated please use  showSearch.filterSort */
  filterSort?: SearchConfig['filterSort']
  /**  @deprecated please use  showSearch.optionFilterProp */
  optionFilterProp?: string
  optionLabelProp?: string
  options?: DefaultOptionType[]
  optionRender?: (oriOption: FlattenOptionData, info: { index: number }) => any

  defaultActiveFirstOption?: boolean
  virtual?: boolean
  direction?: 'ltr' | 'rtl'
  listHeight?: number
  listItemHeight?: number
  labelRender?: (props: LabelInValueType) => any

  // >>> Icon
  menuItemSelectedIcon?: RenderNode

  mode?: 'combobox' | 'multiple' | 'tags'
  labelInValue?: boolean
  value?: any | null
  defaultValue?: any | null
  maxCount?: number
  onChange?: (value: any, option?: any | any[]) => void
  classNames?: Partial<Record<SemanticName, string>>
  styles?: Partial<Record<SemanticName, CSSProperties>>
  // popupMatchSelectWidth?: boolean | number
  // autoFocus?: boolean
  // placeholder?: VueNode
}

const omitKeyList: string[] = [
  // Base
  'id',
  'mode',
  'prefixCls',
  'backfill',
  'fieldNames',

  // Search
  'showSearch',
  'searchValue',
  'onSearch',
  'autoClearSearchValue',
  'filterOption',
  'optionFilterProp',
  'filterSort',

  // Select
  'onSelect',
  'onDeselect',
  'onActive',
  'popupMatchSelectWidth',
  'optionLabelProp',
  'options',
  'optionRender',
  'children',
  'defaultActiveFirstOption',
  'menuItemSelectedIcon',
  'virtual',
  'direction',
  'listHeight',
  'listItemHeight',
  'labelRender',

  // Value
  'value',
  'defaultValue',
  'labelInValue',
  'onChange',
  'maxCount',
  'classNames',
  'styles',
]

function isRawValue(value: DraftValueType): value is RawValueType {
  return !value || typeof value !== 'object'
}

const defaults = {
  prefixCls: 'vc-select',
  popupMatchSelectWidth: true,
  listHeight: 200,
  listItemHeight: 20,
} as any

const Select = defineComponent<SelectProps>({
  name: 'VcSelect',
  inheritAttrs: false,
  setup(props = defaults, { attrs, expose, slots }) {
    const baseSelectRef = shallowRef<BaseSelectRef | null>(null)

    // Expose
    expose({
      focus: () => baseSelectRef.value?.focus(),
      blur: () => baseSelectRef.value?.blur(),
      scrollTo: (arg: any) => baseSelectRef.value?.scrollTo?.(arg),
    })

    const mergedId = useId(props.id)
    const multiple = computed(() => isMultiple(props.mode as any))

    // =========================== Search ===========================
    const [mergedShowSearch, searchConfig] = useSearchConfig(
      toRef(props, 'showSearch'),
      {
        filterOption: toRef(props, 'filterOption'),
        searchValue: toRef(props, 'searchValue'),
        optionFilterProp: toRef(props, 'optionFilterProp'),
        filterSort: toRef(props, 'filterSort'),
        onSearch: toRef(props, 'onSearch'),
        autoClearSearchValue: toRef(props, 'autoClearSearchValue'),
      },
      toRef(props, 'mode'),
    )

    const mergedFilterOption = computed(() => {
      if (searchConfig.value.filterOption === undefined && props.mode === 'combobox') {
        return false
      }
      return searchConfig.value.filterOption
    })

    // ========================= FieldNames =========================
    const mergedFieldNames = computed(() =>
      fillFieldNames(props.fieldNames, false),
    )

    // =========================== Search ===========================
    const internalSearchValue = shallowRef(props.searchValue || '')
    watch(() => props.searchValue, (val) => {
      if (val !== undefined) {
        internalSearchValue.value = val
      }
    })

    const setSearchValue = (val: string) => {
      internalSearchValue.value = val
    }

    const mergedSearchValue = computed(() => internalSearchValue.value || '')

    const childrenOptions = computed(() => {
      const children = filterEmpty(slots?.default?.() ?? [])
      return convertChildrenToData(children)
    })

    // =========================== Option ===========================
    const parsedOptions = useOptions(
      toRef(props, 'options'),
      childrenOptions,
      mergedFieldNames,
      toRef(props, 'optionFilterProp'),
      toRef(props, 'optionLabelProp'),
    )

    const valueOptions = computed(() => parsedOptions.value.valueOptions)
    const labelOptions = computed(() => parsedOptions.value.labelOptions)
    const mergedOptions = computed(() => parsedOptions.value.options)

    // ========================= Wrap Value =========================
    const convert2LabelValues = (draftValues: DraftValueType): LabelInValueType[] => {
      // Convert to array
      const valueList = toArray(draftValues)

      // Convert to labelInValue type
      return valueList.map((val) => {
        let rawValue: RawValueType
        let rawLabel: VueNode
        let rawDisabled: boolean | undefined
        let rawTitle: string | undefined

        // Fill label & value
        if (isRawValue(val)) {
          rawValue = val
        }
        else {
          rawLabel = (val as LabelInValueType).label
          rawValue = (val as LabelInValueType).value
        }

        const option = valueOptions.value.get(rawValue)
        if (option) {
          // Fill missing props
          if (rawLabel === undefined) {
            rawLabel = option?.[props.optionLabelProp || mergedFieldNames.value.label]
          }
          rawDisabled = option?.disabled
          rawTitle = option?.title
        }

        return {
          label: rawLabel,
          value: rawValue,
          key: rawValue,
          disabled: rawDisabled,
          title: rawTitle,
        } as LabelInValueType
      })
    }

    // =========================== Values ===========================
    const internalValue = shallowRef<any>(props.defaultValue)
    watch(() => props.value, (val) => {
      if (val !== undefined) {
        internalValue.value = val
      }
    }, { immediate: true })

    const setInternalValue = (val: any) => {
      if (props.value === undefined) {
        internalValue.value = val
      }
    }

    // Merged value with LabelValueType
    const rawLabeledValues = computed(() => {
      const newInternalValue = multiple.value && internalValue.value === null ? [] : internalValue.value
      const values = convert2LabelValues(newInternalValue)

      // combobox no need save value when it's no value (exclude value equal 0)
      if (props.mode === 'combobox' && isComboNoValue(values[0]?.value)) {
        return []
      }

      return values
    })

    // Fill label with cache to avoid option remove
    const [mergedValues, getMixedOption] = useCache(
      rawLabeledValues as Ref<LabelInValueType[]>,
      valueOptions,
    )

    const displayValues = computed(() => {
      // `null` need show as placeholder instead
      // https://github.com/ant-design/ant-design/issues/25057
      if (!props.mode && mergedValues.value.length === 1) {
        const firstValue = mergedValues.value[0]
        if (
          firstValue.value === null
          && (firstValue.label === null || firstValue.label === undefined)
        ) {
          return []
        }
      }

      return mergedValues.value.map(item => ({
        ...item,
        label: (typeof props.labelRender === 'function' ? props.labelRender(item) : item.label) ?? item.value,
      }))
    })

    /** Convert `displayValues` to raw value type set */
    const rawValues = computed(() => new Set(mergedValues.value.map(val => val.value)))

    // Sync combobox search value
    watch(mergedValues, () => {
      if (props.mode === 'combobox') {
        const strValue = mergedValues.value[0]?.value
        setSearchValue(hasValue(strValue) ? String(strValue) : '')
      }
    })

    // ======================= Display Option =======================
    // Create a placeholder item if not exist in `options`
    const createTagOption = useRefFunc((val: RawValueType, label?: VueNode) => {
      const mergedLabel = label ?? val
      return {
        [mergedFieldNames.value.value]: val,
        [mergedFieldNames.value.label]: mergedLabel,
      } as DefaultOptionType
    })

    // Fill tag as option if mode is `tags`
    const filledTagOptions = computed(() => {
      if (props.mode !== 'tags') {
        return mergedOptions.value
      }

      // >>> Tag mode
      const cloneOptions = [...mergedOptions.value]

      // Check if value exist in options (include new patch item)
      const existOptions = (val: RawValueType) => valueOptions.value.has(val)

      // Fill current value as option
      ;[...mergedValues.value]
        .sort((a, b) => (a.value < b.value ? -1 : 1))
        .forEach((item) => {
          const val = item.value

          if (!existOptions(val)) {
            cloneOptions.push(createTagOption(val, item.label))
          }
        })

      return cloneOptions
    })

    const filteredOptions = useFilterOptions(
      filledTagOptions,
      mergedFieldNames,
      mergedSearchValue,
      mergedFilterOption,
      toRef(props, 'optionFilterProp'),
    )

    // Fill options with search value if needed
    const filledSearchOptions = computed(() => {
      if (
        props.mode !== 'tags'
        || !mergedSearchValue.value
        || filteredOptions.value.some(
          item => item[props.optionFilterProp || 'value'] === mergedSearchValue.value,
        )
      ) {
        return filteredOptions.value
      }
      // ignore when search value equal select input value
      if (filteredOptions.value.some(
        item => item[mergedFieldNames.value.value] === mergedSearchValue.value,
      )) {
        return filteredOptions.value
      }
      // Fill search value as option
      return [createTagOption(mergedSearchValue.value), ...filteredOptions.value]
    })

    const sorter = (inputOptions: DefaultOptionType[]): DefaultOptionType[] => {
      const sortedOptions = [...inputOptions].sort((a, b) =>
        searchConfig.value.filterSort!(a, b, { searchValue: mergedSearchValue.value }),
      )
      return sortedOptions.map((item) => {
        if (Array.isArray(item.options)) {
          return {
            ...item,
            options: item.options.length > 0 ? sorter(item.options) : item.options,
          }
        }
        return item
      })
    }

    const orderedFilteredOptions = computed(() => {
      if (!searchConfig.value.filterSort) {
        return filledSearchOptions.value
      }

      return sorter(filledSearchOptions.value)
    })

    const displayOptions = computed(() =>
      flattenOptions(orderedFilteredOptions.value, {
        fieldNames: mergedFieldNames.value,
        childrenAsData: false,
      }),
    )

    // =========================== Change ===========================
    const triggerChange = (values: DraftValueType) => {
      const labeledValues = convert2LabelValues(values)
      setInternalValue(labeledValues)

      if (
        props.onChange
        // Trigger event only when value changed
        && (labeledValues.length !== mergedValues.value.length
          || labeledValues.some((newVal, index) => mergedValues.value[index]?.value !== newVal?.value))
      ) {
        const returnValues = props.labelInValue
          ? labeledValues.map(({ label: l, value: v }) => ({ label: l, value: v }))
          : labeledValues.map(v => v.value)

        const returnOptions = labeledValues.map(v =>
          injectPropsWithOption(getMixedOption(v.value)),
        )

        props.onChange(
          // Value
          multiple.value ? returnValues : returnValues[0],
          // Option
          multiple.value ? returnOptions : returnOptions[0],
        )
      }
    }

    // ======================= Accessibility ========================
    const activeValue = shallowRef<string | null>(null)
    const accessibilityIndex = shallowRef(0)
    const mergedDefaultActiveFirstOption = computed(() =>
      props.defaultActiveFirstOption !== undefined ? props.defaultActiveFirstOption : props.mode !== 'combobox',
    )

    const onActiveValue: OnActiveValue = (active, index, { source = 'keyboard' } = {}) => {
      accessibilityIndex.value = index

      if (props.backfill && props.mode === 'combobox' && active !== null && source === 'keyboard') {
        activeValue.value = String(active)
      }

      props.onActive?.(active)
    }

    // ========================= OptionList =========================
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
          injectPropsWithOption(option) as DefaultOptionType,
        ]
      }

      if (selected && props.onSelect) {
        const [wrappedValue, option] = getSelectEnt()
        props.onSelect(wrappedValue, option)
      }
      else if (!selected && props.onDeselect && type !== 'clear') {
        const [wrappedValue, option] = getSelectEnt()
        props.onDeselect(wrappedValue, option)
      }
    }

    // Used for OptionList selection
    const onInternalSelect = useRefFunc<OnInternalSelect>((val, info) => {
      let cloneValues: (RawValueType | DisplayValueType)[]

      // Single mode always trigger select only with option list
      const mergedSelect = multiple.value ? info.selected : true

      if (mergedSelect) {
        cloneValues = multiple.value ? [...mergedValues.value, val] : [val]
      }
      else {
        cloneValues = mergedValues.value.filter(v => v.value !== val)
      }

      triggerChange(cloneValues)
      triggerSelect(val, mergedSelect)

      // Clean search value if single or configured
      if (props.mode === 'combobox') {
        activeValue.value = ''
      }
      else if (!multiple.value || searchConfig.value.autoClearSearchValue) {
        setSearchValue('')
        activeValue.value = ''
      }
    })

    // ======================= Display Change =======================
    // BaseSelect display values change
    const onDisplayValuesChange: BaseSelectProps['onDisplayValuesChange'] = (nextValues, info) => {
      triggerChange(nextValues)
      const { type, values } = info

      if (type === 'remove' || type === 'clear') {
        values.forEach((item) => {
          triggerSelect(item.value!, false, type)
        })
      }
    }

    // =========================== Search ===========================
    const onInternalSearch: BaseSelectProps['onSearch'] = (searchText, info) => {
      setSearchValue(searchText)
      activeValue.value = null

      // [Submit] Tag mode should flush input
      if (info.source === 'submit') {
        const formatted = (searchText || '').trim()
        // prevent empty tags from appearing when you click the Enter button
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

        searchConfig.value.onSearch?.(searchText)
      }
    }

    const onInternalSearchSplit: BaseSelectProps['onSearchSplit'] = (words) => {
      let patchValues: RawValueType[] = words

      if (props.mode !== 'tags') {
        patchValues = words
          .map((word) => {
            const opt = labelOptions.value.get(word)
            return opt?.[mergedFieldNames.value.value] as RawValueType
          })
          .filter(val => val !== undefined)
      }

      const newRawValues = Array.from(new Set<RawValueType>([...rawValues.value, ...patchValues]))
      triggerChange(newRawValues)
      newRawValues.forEach((newRawValue) => {
        triggerSelect(newRawValue, true)
      })
    }

    // ========================== Context ===========================
    const selectContext = computed(() => {
      const realVirtual = props.virtual !== false && props.popupMatchSelectWidth !== false
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
        listHeight: props.listHeight,
        listItemHeight: props.listItemHeight,
        childrenAsData: false,
        maxCount: props.maxCount,
        optionRender: props.optionRender,
        classNames: props.classNames,
        styles: props.styles,
      }
    })

    useSelectProvider(selectContext)

    return () => {
      const restAttrs = { ...attrs }
      const restProps = omit(props, omitKeyList as any)
      const {
        prefixCls,
        mode,
        classNames,
        styles,
        maxCount,
        placeholder,
        direction,
        popupMatchSelectWidth,
      } = props
      return (
        <BaseSelect
          {...restAttrs}
          {...restProps}
          placeholder={placeholder}
          // >>> MISC
          id={mergedId}
          prefixCls={prefixCls!}
          ref={(el: any) => { baseSelectRef.value = el }}
          omitDomProps={OMIT_DOM_PROPS}
          mode={mode}
          // >>> Style
          classNames={classNames}
          styles={styles}
          // >>> Values
          displayValues={displayValues.value}
          onDisplayValuesChange={onDisplayValuesChange}
          maxCount={maxCount}
          // >>> Trigger
          direction={direction}
          // >>> Search
          showSearch={mergedShowSearch.value}
          searchValue={mergedSearchValue.value}
          onSearch={onInternalSearch}
          autoClearSearchValue={searchConfig.value.autoClearSearchValue}
          onSearchSplit={onInternalSearchSplit}
          popupMatchSelectWidth={popupMatchSelectWidth}
          // >>> OptionList
          OptionList={OptionList}
          emptyOptions={!displayOptions.value.length}
          // >>> Accessibility
          activeValue={activeValue.value || undefined}
          activeDescendantId={`${mergedId}_list_${accessibilityIndex.value}`}
        />
      )
    }
  },
})

export default Select
