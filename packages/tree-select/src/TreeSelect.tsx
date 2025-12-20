import type { BaseSelectPropsWithoutPrivate, BaseSelectRef, BaseSelectSemanticName } from '@v-c/select'
import type { ExpandAction, IconType } from '@v-c/tree'
import type { VueNode } from '@v-c/util'
import type { CSSProperties, VNode } from 'vue'
import type { DataNode, DefaultValueType, FieldNames, Key, LabeledValueType, SafeKey, SelectSource, SimpleModeConfig } from './interface'
import type { CheckedStrategy } from './utils/strategyUtil'
import { BaseSelect } from '@v-c/select'
import { conductCheck } from '@v-c/tree'
import { omit, useId, useMergedState } from '@v-c/util'
import { filterEmpty } from '@v-c/util/dist/props-util'
import { computed, defineComponent, shallowRef, watch } from 'vue'
import useCache from './hooks/useCache'
import useCheckedKeys from './hooks/useCheckedKeys'
import useDataEntities from './hooks/useDataEntities'
import useFilterTreeData from './hooks/useFilterTreeData'
import useRefFunc from './hooks/useRefFunc'
import useSearchConfig from './hooks/useSearchConfig'
import useTreeData from './hooks/useTreeData'
import { useLegacyProvider } from './LegacyContext'
import OptionList from './OptionList'
import { useTreeSelectProvider } from './TreeSelectContext'
import { convertChildrenToData, fillAdditionalInfo, fillLegacyProps } from './utils/legacyUtil'
import { formatStrategyValues, SHOW_ALL, SHOW_CHILD } from './utils/strategyUtil'
import { fillFieldNames, isNil, toArray } from './utils/valueUtil'
import warningProps from './utils/warningPropsUtil'

export type SemanticName = BaseSelectSemanticName
export type PopupSemantic = 'item' | 'itemTitle'

export interface SearchConfig {
  searchValue?: string
  onSearch?: (value: string) => void
  autoClearSearchValue?: boolean
  filterTreeNode?: boolean | ((inputValue: string, treeNode: DataNode) => boolean)
  treeNodeFilterProp?: string
}

export interface TreeSelectProps<ValueType = any, OptionType extends DataNode = DataNode>
  extends Omit<BaseSelectPropsWithoutPrivate, 'mode' | 'classNames' | 'styles' | 'showSearch'> {
  prefixCls?: string
  id?: string
  classNames?: Partial<Record<SemanticName, string>> & {
    popup?: Partial<Record<PopupSemantic, string>>
  }
  styles?: Partial<Record<SemanticName, CSSProperties>> & {
    popup?: Partial<Record<PopupSemantic, CSSProperties>>
  }

  // >>> Value
  value?: ValueType
  defaultValue?: ValueType
  onChange?: (value: ValueType, labelList: VueNode[] | null, extra: any) => void

  // >>> Search
  showSearch?: boolean | SearchConfig
  /** @deprecated Use `showSearch.searchValue` instead */
  searchValue?: string
  /** @deprecated Use `showSearch.searchValue` instead */
  inputValue?: string
  /** @deprecated Use `showSearch.onSearch` instead */
  onSearch?: (value: string) => void
  /** @deprecated Use `showSearch.autoClearSearchValue` instead */
  autoClearSearchValue?: boolean
  /** @deprecated Use `showSearch.filterTreeNode` instead */
  filterTreeNode?: boolean | ((inputValue: string, treeNode: DataNode) => boolean)
  /** @deprecated Use `showSearch.treeNodeFilterProp` instead */
  treeNodeFilterProp?: string

  // >>> Select
  onSelect?: (value: ValueType, option: OptionType) => void
  onDeselect?: (value: ValueType, option: OptionType) => void

  // >>> Selector
  showCheckedStrategy?: CheckedStrategy
  treeNodeLabelProp?: string

  // >>> Field Names
  fieldNames?: FieldNames

  // >>> Mode
  multiple?: boolean
  treeCheckable?: boolean | VueNode
  treeCheckStrictly?: boolean
  labelInValue?: boolean
  maxCount?: number

  // >>> Data
  treeData?: OptionType[]
  treeDataSimpleMode?: boolean | SimpleModeConfig
  loadData?: (dataNode: any) => Promise<unknown>
  treeLoadedKeys?: SafeKey[]
  onTreeLoad?: (loadedKeys: SafeKey[]) => void

  // >>> Expanded
  treeDefaultExpandAll?: boolean
  treeExpandedKeys?: SafeKey[]
  treeDefaultExpandedKeys?: SafeKey[]
  onTreeExpand?: (expandedKeys: SafeKey[]) => void
  treeExpandAction?: ExpandAction

  // >>> Options
  virtual?: boolean
  listHeight?: number
  listItemHeight?: number
  listItemScrollOffset?: number
  onPopupVisibleChange?: (open: boolean) => void
  treeTitleRender?: (node: OptionType) => VueNode

  // >>> Tree
  treeLine?: boolean
  treeIcon?: IconType
  showTreeIcon?: boolean
  switcherIcon?: IconType
  treeMotion?: any

  onPopupScroll?: (event: Event) => void
  popupMatchSelectWidth?: boolean | number
}

function isRawValue(value: SafeKey | LabeledValueType): value is SafeKey {
  return !value || typeof value !== 'object'
}

const defaults = {
  prefixCls: 'vc-tree-select',
  listHeight: 200,
  listItemHeight: 20,
  listItemScrollOffset: 0,
  popupMatchSelectWidth: true,
} as any

const omitKeyList: string[] = [
  'id',
  'prefixCls',

  // Value
  'value',
  'defaultValue',
  'onChange',

  // Search
  'showSearch',
  'searchValue',
  'inputValue',
  'onSearch',
  'autoClearSearchValue',
  'filterTreeNode',
  'treeNodeFilterProp',

  // Select
  'onSelect',
  'onDeselect',

  // Selector
  'showCheckedStrategy',
  'treeNodeLabelProp',

  // Field Names
  'fieldNames',

  // Mode
  'multiple',
  'treeCheckable',
  'treeCheckStrictly',
  'labelInValue',
  'maxCount',

  // Data
  'treeData',
  'treeDataSimpleMode',

  // Expanded
  'treeDefaultExpandAll',
  'treeExpandedKeys',
  'treeDefaultExpandedKeys',
  'onTreeExpand',
  'treeExpandAction',

  // Options
  'virtual',
  'listHeight',
  'listItemHeight',
  'listItemScrollOffset',
  'onPopupVisibleChange',
  'popupMatchSelectWidth',

  // Tree
  'treeTitleRender',
  'treeLine',
  'treeIcon',
  'showTreeIcon',
  'switcherIcon',
  'treeMotion',
  'treeLoadedKeys',
  'onTreeLoad',
  'loadData',
  'onPopupScroll',

  // Style
  'classNames',
  'styles',
]

const TreeSelect = defineComponent<TreeSelectProps>({
  name: 'TreeSelect',
  inheritAttrs: false,
  setup(props = defaults, { attrs, expose, slots }) {
    const baseSelectRef = shallowRef<BaseSelectRef | null>(null)

    expose({
      focus: () => baseSelectRef.value?.focus(),
      blur: () => baseSelectRef.value?.blur(),
      scrollTo: (arg: any) => baseSelectRef.value?.scrollTo?.(arg),
    })

    const mergedId = useId(props.id)

    const treeConduction = computed(() => !!props.treeCheckable && !props.treeCheckStrictly)
    const mergedCheckable = computed(() => props.treeCheckable || props.treeCheckStrictly)
    const mergedLabelInValue = computed(() => !!props.treeCheckStrictly || !!props.labelInValue)
    const mergedMultiple = computed(() => !!mergedCheckable.value || !!props.multiple)

    const searchProps = computed(() => ({
      searchValue: props.searchValue,
      inputValue: props.inputValue,
      onSearch: props.onSearch,
      autoClearSearchValue: props.autoClearSearchValue,
      filterTreeNode: props.filterTreeNode,
      treeNodeFilterProp: props.treeNodeFilterProp,
    }))

    const [mergedShowSearch, searchConfig] = useSearchConfig(
      computed(() => props.showSearch),
      searchProps,
    )

    const mergedTreeNodeFilterProp = computed(() => searchConfig.value.treeNodeFilterProp || 'value')
    const mergedAutoClearSearchValue = computed(() => searchConfig.value.autoClearSearchValue !== false)

    const internalValue = shallowRef(props?.value ?? props?.defaultValue)
    watch(() => props.value, () => {
      internalValue.value = props?.value
    })
    const setInternalValue = (val: any) => {
      internalValue.value = val
    }
    const mergedShowCheckedStrategy = computed(() => {
      if (!props.treeCheckable) {
        return SHOW_ALL
      }
      return props.showCheckedStrategy || SHOW_CHILD
    })

    // ========================== Warning ===========================
    if (process.env.NODE_ENV !== 'production') {
      warningProps(props as any)
    }

    // ========================= FieldNames =========================
    const mergedFieldNames = computed(() => fillFieldNames(props.fieldNames))

    // =========================== Search ===========================
    const [internalSearchValue, setSearchValue] = useMergedState<string>(() => '', {
      value: computed(() => searchConfig.value.searchValue) as any,
    })

    const mergedSearchValue = computed(() => internalSearchValue.value || '')

    const onInternalSearch = (searchText: string) => {
      setSearchValue(searchText)
      searchConfig.value.onSearch?.(searchText)
    }

    // ============================ Data ============================
    const slotTreeData = shallowRef<DataNode[]>([])
    const slotTreeDataSignature = shallowRef('')

    const mergedSourceTreeData = computed<DataNode[]>(() => {
      if (props.treeData !== undefined) {
        return props.treeData as any
      }
      return slotTreeData.value
    })

    const getTreeDataSignature = (data: DataNode[]) => {
      const dig = (list: DataNode[]): string => {
        return (list || []).map((node) => {
          const key = String((node as any)?.key)
          const children = (node as any)?.children as DataNode[] | undefined
          return `${key}{${children?.length ? dig(children) : ''}}`
        }).join('|')
      }
      return dig(data)
    }

    const mergedTreeData = useTreeData(
      mergedSourceTreeData,
      computed(() => props.treeDataSimpleMode),
    )

    const { keyEntities, valueEntities } = useDataEntities(mergedTreeData, mergedFieldNames)

    const splitRawValues = (newRawValues: SafeKey[]) => {
      const missingRawValues: SafeKey[] = []
      const existRawValues: SafeKey[] = []

      // Keep missing value in the cache
      newRawValues.forEach((val) => {
        if (valueEntities.value.has(val)) {
          existRawValues.push(val)
        }
        else {
          missingRawValues.push(val)
        }
      })

      return { missingRawValues, existRawValues }
    }

    const filteredTreeData = useFilterTreeData(
      mergedTreeData,
      mergedSearchValue,
      {
        fieldNames: mergedFieldNames as any,
        treeNodeFilterProp: mergedTreeNodeFilterProp,
        filterTreeNode: computed(() => searchConfig.value.filterTreeNode),
      },
    )

    // =========================== Label ============================
    const getLabel = (item: DataNode) => {
      if (!item) {
        return
      }

      if (props.treeNodeLabelProp) {
        return (item as any)[props.treeNodeLabelProp]
      }

      const titleList = (mergedFieldNames.value as any)._title as string[]

      for (let i = 0; i < titleList.length; i += 1) {
        const title = (item as any)[titleList[i]]
        if (title !== undefined) {
          return title
        }
      }
    }

    // ========================= Wrap Value =========================
    const toLabeledValues = (draftValues: DefaultValueType) => {
      const values = toArray(draftValues as any)

      return values.map((val) => {
        if (isRawValue(val as any)) {
          return { value: val }
        }
        return val
      })
    }

    const renderTreeTitleRender = (node: DataNode) => {
      let label: any
      const labelInfo = props?.treeTitleRender?.(node as any)
      if (typeof labelInfo === 'string' || typeof labelInfo === 'number') {
        label = labelInfo
      }
      else {
        const labelArr = filterEmpty(Array.isArray(labelInfo) ? labelInfo : [labelInfo])
        if (labelArr.length) {
          label = labelArr.length === 1 ? labelArr[0] : labelArr
        }
      }
      return label
    }

    const convert2LabelValues = (draftValues: DefaultValueType) => {
      const values = toLabeledValues(draftValues)

      return values.map((item: any) => {
        let { label: rawLabel } = item
        const { value: rawValue, halfChecked: rawHalfChecked } = item

        let rawDisabled: boolean | undefined

        const entity = valueEntities.value.get(rawValue)

        // Fill missing label & status
        if (entity) {
          rawLabel = props.treeTitleRender
            ? renderTreeTitleRender(entity.node as any)
            : (rawLabel ?? getLabel(entity.node as any))
          rawDisabled = (entity.node as any).disabled
        }
        else if (rawLabel === undefined) {
          // We try to find in current `labelInValue` value
          const labelInValueItem = toLabeledValues(internalValue.value).find(
            (labeledItem: any) => labeledItem.value === rawValue,
          )
          rawLabel = labelInValueItem?.label
        }

        return {
          label: rawLabel,
          value: rawValue,
          halfChecked: rawHalfChecked,
          disabled: rawDisabled,
        }
      })
    }

    // =========================== Values ===========================
    const rawMixedLabeledValues = computed<LabeledValueType[]>(() =>
      toLabeledValues(internalValue.value === null ? [] as any : internalValue.value),
    )

    const rawLabeledValues = computed<LabeledValueType[]>(() =>
      rawMixedLabeledValues.value.filter((item: any) => !item.halfChecked),
    )

    const rawHalfLabeledValues = computed<LabeledValueType[]>(() =>
      rawMixedLabeledValues.value.filter((item: any) => !!item.halfChecked),
    )

    const rawValues = computed(() => rawLabeledValues.value.map(item => item.value))

    const [rawCheckedValues, rawHalfCheckedValues] = useCheckedKeys(
      rawLabeledValues,
      rawHalfLabeledValues,
      treeConduction,
      keyEntities as any,
    )

    const displayValues = computed<LabeledValueType[]>(() => {
      const displayKeys = formatStrategyValues(
        rawCheckedValues.value as SafeKey[],
        mergedShowCheckedStrategy.value,
        keyEntities.value as any,
        mergedFieldNames.value as any,
      )

      const values = displayKeys.map(key =>
        (keyEntities.value as any)[String(key)]?.node?.[(mergedFieldNames.value as any).value] ?? key,
      )

      const labeledValues = values.map((val) => {
        const targetItem = rawLabeledValues.value.find(item => item.value === val)
        let label
        if (props.labelInValue) {
          label = targetItem?.label
        }
        else {
          label = renderTreeTitleRender(targetItem as any)
        }
        return {
          value: val,
          label,
        }
      })

      const rawDisplayValues = convert2LabelValues(labeledValues as any)
      const firstVal = rawDisplayValues[0] as any

      if (!mergedMultiple.value && firstVal && isNil(firstVal.value) && isNil(firstVal.label)) {
        return []
      }

      return rawDisplayValues.map((item: any) => ({
        ...item,
        label: item.label ?? item.value,
      }))
    })

    const [cachedDisplayValues] = useCache(displayValues)

    // ========================== MaxCount ==========================
    const mergedMaxCount = computed(() => {
      if (
        mergedMultiple.value
        && (mergedShowCheckedStrategy.value === SHOW_CHILD || props.treeCheckStrictly || !props.treeCheckable)
      ) {
        return props.maxCount
      }
      return null
    })

    // =========================== Change ===========================
    const triggerChange = useRefFunc(
      (
        newRawValues: SafeKey[],
        extra: { triggerValue?: SafeKey, selected?: boolean },
        source: SelectSource,
      ) => {
        const formattedKeyList = formatStrategyValues(
          newRawValues,
          mergedShowCheckedStrategy.value,
          keyEntities.value as any,
          mergedFieldNames.value as any,
        )

        // Not allow pass with `maxCount`
        if (mergedMaxCount.value && formattedKeyList.length > mergedMaxCount.value) {
          return
        }

        const labeledValues = convert2LabelValues(newRawValues as any)
        setInternalValue(labeledValues)

        // Clean up if needed
        if (mergedAutoClearSearchValue.value) {
          setSearchValue('')
        }

        if (props.onChange) {
          let eventValues: SafeKey[] = newRawValues
          if (treeConduction.value) {
            eventValues = formattedKeyList.map((key) => {
              const entity = valueEntities.value.get(key)
              return entity ? (entity.node as any)[(mergedFieldNames.value as any).value] : key
            })
          }

          const { triggerValue, selected } = extra || {
            triggerValue: undefined,
            selected: undefined,
          }

          let returnRawValues: any[] = eventValues

          // We need fill half check back
          if (props.treeCheckStrictly) {
            const halfValues = rawHalfLabeledValues.value.filter(item => !eventValues.includes(item.value as any))
            returnRawValues = [...returnRawValues, ...halfValues]
          }

          const returnLabeledValues = convert2LabelValues(returnRawValues as any)
          const additionalInfo: any = {
            preValue: rawLabeledValues.value,
            triggerValue,
          }

          let showPosition = true
          if (props.treeCheckStrictly || (source === 'selection' && !selected)) {
            showPosition = false
          }

          fillAdditionalInfo(
            additionalInfo,
            triggerValue as any,
            newRawValues,
            mergedTreeData.value,
            showPosition,
            mergedFieldNames.value as any,
          )

          if (mergedCheckable.value) {
            additionalInfo.checked = selected
          }
          else {
            additionalInfo.selected = selected
          }

          const returnValues = mergedLabelInValue.value
            ? returnLabeledValues
            : returnLabeledValues.map((item: any) => item.value)

          props.onChange(
            mergedMultiple.value ? returnValues : returnValues[0],
            mergedLabelInValue.value ? null : returnLabeledValues.map((item: any) => item.label),
            additionalInfo,
          )
        }
      },
    )

    // ========================== Options ===========================
    const onOptionSelect = (
      selectedKey: SafeKey,
      { selected, source }: { selected: boolean, source?: SelectSource },
    ) => {
      const entity = (keyEntities.value as any)[String(selectedKey)]
      const node = entity?.node
      const selectedValue = node?.[(mergedFieldNames.value as any).value] ?? selectedKey

      if (!mergedMultiple.value) {
        triggerChange([selectedValue], { selected: true, triggerValue: selectedValue }, 'option')
      }
      else {
        let newRawValues = selected
          ? [...(rawValues.value as any), selectedValue]
          : (rawCheckedValues.value as any).filter((v: any) => v !== selectedValue)

        // Add keys if tree conduction
        if (treeConduction.value) {
          const { missingRawValues, existRawValues } = splitRawValues(newRawValues)
          const keyList = existRawValues.map((val) => {
            const entity = valueEntities.value.get(val)
            return entity ? entity.key : val
          })

          // Conduction by selected or not
          let checkedKeys: Key[]
          if (selected) {
            ;({ checkedKeys } = conductCheck(keyList, true, keyEntities.value as any))
          }
          else {
            ;({ checkedKeys } = conductCheck(
              keyList,
              { checked: false, halfCheckedKeys: rawHalfCheckedValues.value as any },
              keyEntities.value as any,
            ))
          }

          newRawValues = [
            ...missingRawValues,
            ...checkedKeys.map(key =>
              (keyEntities.value as any)[String(key)].node[(mergedFieldNames.value as any).value]),
          ]
        }

        triggerChange(newRawValues, { selected, triggerValue: selectedValue }, source || 'option')
      }

      // Trigger select event
      if (selected || !mergedMultiple.value) {
        props.onSelect?.(selectedValue as any, fillLegacyProps(node))
      }
      else {
        props.onDeselect?.(selectedValue as any, fillLegacyProps(node))
      }
    }

    // ========================== Dropdown ==========================
    const onInternalPopupVisibleChange = (open: boolean) => {
      props.onPopupVisibleChange?.(open)
    }

    // ====================== Display Change ========================
    const onDisplayValuesChange = useRefFunc((newValues: any[], info: any) => {
      const newRawValues = newValues.map(item => item.value)

      if (info.type === 'clear') {
        triggerChange(newRawValues, {}, 'selection')
        return
      }

      // TreeSelect only have multiple mode which means display change only has remove
      if (info.values.length) {
        onOptionSelect(info.values[0].value, { selected: false, source: 'selection' })
      }
    })

    // ========================== Context ===========================
    const treeSelectContext = computed(() => {
      return {
        virtual: props.virtual,
        popupMatchSelectWidth: props.popupMatchSelectWidth ?? defaults.popupMatchSelectWidth,
        listHeight: props.listHeight ?? defaults.listHeight,
        listItemHeight: props.listItemHeight ?? defaults.listItemHeight,
        listItemScrollOffset: props.listItemScrollOffset ?? defaults.listItemScrollOffset,
        treeData: filteredTreeData.value,
        fieldNames: mergedFieldNames.value as any,
        onSelect: onOptionSelect,
        treeExpandAction: props.treeExpandAction,
        treeTitleRender: props.treeTitleRender,
        onPopupScroll: props.onPopupScroll,
        leftMaxCount: props.maxCount === undefined ? null : props.maxCount - cachedDisplayValues.value.length,
        leafCountOnly:
          mergedShowCheckedStrategy.value === SHOW_CHILD && !props.treeCheckStrictly && !!props.treeCheckable,
        valueEntities: valueEntities.value as any,
        classNames: props.classNames,
        styles: props.styles,
      }
    })

    useTreeSelectProvider(treeSelectContext as any)

    const legacyContext = computed(() => ({
      checkable: mergedCheckable.value,
      loadData: props.loadData,
      treeLoadedKeys: props.treeLoadedKeys,
      onTreeLoad: props.onTreeLoad,
      checkedKeys: rawCheckedValues.value as any,
      halfCheckedKeys: rawHalfCheckedValues.value as any,
      treeDefaultExpandAll: props.treeDefaultExpandAll,
      treeExpandedKeys: props.treeExpandedKeys as any,
      treeDefaultExpandedKeys: props.treeDefaultExpandedKeys || [],
      onTreeExpand: props.onTreeExpand,
      treeIcon: props.treeIcon,
      treeMotion: props.treeMotion,
      showTreeIcon: props.showTreeIcon,
      switcherIcon: props.switcherIcon,
      treeLine: props.treeLine,
      treeNodeFilterProp: mergedTreeNodeFilterProp.value,
      keyEntities: keyEntities.value as any,
    }))

    useLegacyProvider(legacyContext as any)

    return () => {
      // Update slot tree data in render context
      if (props.treeData === undefined) {
        const children = (slots.default?.() ?? []) as VNode[]
        const parsed = convertChildrenToData(children)
        const signature = getTreeDataSignature(parsed)
        if (signature !== slotTreeDataSignature.value) {
          slotTreeDataSignature.value = signature
          slotTreeData.value = parsed
        }
      }

      const restAttrs = { ...attrs }
      const restProps = omit(props, omitKeyList as any)
      return (
        <BaseSelect
          {...restAttrs}
          {...restProps}
          ref={(el: any) => {
            baseSelectRef.value = el
          }}
          // >>> MISC
          id={mergedId}
          prefixCls={props.prefixCls || defaults.prefixCls}
          mode={mergedMultiple.value ? 'multiple' : undefined}
          // >>> Style
          classNames={props.classNames as any}
          styles={props.styles as any}
          // >>> Display Value
          displayValues={cachedDisplayValues.value as any}
          onDisplayValuesChange={onDisplayValuesChange as any}
          // >>> Search
          autoClearSearchValue={mergedAutoClearSearchValue.value}
          showSearch={mergedShowSearch.value}
          searchValue={mergedSearchValue.value}
          onSearch={(v: string) => {
            onInternalSearch(v)
          }}
          // >>> Options
          OptionList={OptionList}
          emptyOptions={!mergedTreeData.value.length}
          onPopupVisibleChange={onInternalPopupVisibleChange}
          popupMatchSelectWidth={props.popupMatchSelectWidth ?? defaults.popupMatchSelectWidth}
        />
      )
    }
  },
})

export default TreeSelect
