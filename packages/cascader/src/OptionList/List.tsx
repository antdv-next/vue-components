import type { ComputedRef } from 'vue'
import type { DefaultOptionType, LegacyKey, SingleValueType } from '../Cascader'
import { clsx } from '@v-c/util'
import { computed, defineComponent, nextTick, ref, watch, watchEffect } from 'vue'
import { useCascaderContext } from '../context'
import {
  getFullPathKeys,
  isLeaf,
  scrollIntoParentView,
  toPathKey,
  toPathKeys,
  toPathValueStr,
} from '../utils/commonUtil'
import { toPathOptions } from '../utils/treeUtil'
import CacheContent from './CacheContent'
import Column, { FIX_LABEL } from './Column'
import useActive from './useActive'
import useKeyboard from './useKeyboard'

export interface RawOptionListProps {
  prefixCls: string
  multiple?: boolean
  searchValue?: string
  toggleOpen: (open?: boolean) => void
  notFoundContent?: any
  direction?: 'ltr' | 'rtl'
  open?: boolean
  disabled?: boolean
}

const rawOptionListDefaults: RawOptionListProps = {
  prefixCls: '',
  multiple: false,
  searchValue: '',
  toggleOpen: () => {},
  open: false,
  direction: 'ltr',
  disabled: false,
}

const RawOptionList = defineComponent<RawOptionListProps>((props = rawOptionListDefaults, { expose }) => {
  const containerRef = ref<HTMLDivElement | null>(null)
  const rtl = computed(() => props.direction === 'rtl')

  const context = useCascaderContext()

  const mergedPrefixCls = computed(() => context.value?.popupPrefixCls || props.prefixCls)

  const mergedFieldNames = computed(() => context.value?.fieldNames)

  // ========================= loadData =========================
  const loadingKeys = ref<LegacyKey[]>([])

  const internalLoadData = (valueCells: LegacyKey[]) => {
    // Do not load when search
    if (!context.value?.loadData || props.searchValue) {
      return
    }

    const fieldNames = mergedFieldNames.value
    const options = context.value?.options || []
    if (!fieldNames) {
      return
    }

    const optionList = toPathOptions(valueCells as SingleValueType, options, fieldNames)
    const rawOptions = optionList.map(({ option }) => option)
    const lastOption = rawOptions[rawOptions.length - 1]

    if (lastOption && !isLeaf(lastOption, fieldNames)) {
      const pathKey = toPathKey(valueCells as SingleValueType)

      loadingKeys.value = [...loadingKeys.value, pathKey]

      context.value.loadData(rawOptions)
    }
  }

  watchEffect(() => {
    const fieldNames = mergedFieldNames.value
    const options = context.value?.options || []

    if (!loadingKeys.value.length || !fieldNames) {
      return
    }

    const nextLoadingKeys = loadingKeys.value.filter((loadingKey) => {
      const valueStrCells = toPathValueStr(String(loadingKey))
      const optionList = toPathOptions(valueStrCells as SingleValueType, options, fieldNames, true)
        .map(({ option }) => option)
      const lastOption = optionList[optionList.length - 1]

      return !(!lastOption || lastOption[fieldNames.children] || isLeaf(lastOption, fieldNames))
    })

    const isSame
      = nextLoadingKeys.length === loadingKeys.value.length
        && nextLoadingKeys.every((key, index) => key === loadingKeys.value[index])

    if (!isSame) {
      loadingKeys.value = nextLoadingKeys
    }
  })

  // ========================== Values ==========================
  const checkedSet = computed(() => new Set(toPathKeys(context.value?.values || [])))
  const halfCheckedSet = computed(() => new Set(toPathKeys(context.value?.halfValues || [])))

  // ====================== Accessibility =======================
  const [activeValueCells, setActiveValueCells] = useActive(
    computed(() => !!props.multiple),
    computed(() => props.open),
  )

  // =========================== Path ===========================
  const onPathOpen = (nextValueCells: LegacyKey[]) => {
    setActiveValueCells(nextValueCells)

    // Trigger loadData
    internalLoadData(nextValueCells)
  }

  const isSelectable = (option: DefaultOptionType) => {
    if (props.disabled) {
      return false
    }

    const { disabled: optionDisabled } = option
    const fieldNames = mergedFieldNames.value
    if (!fieldNames) {
      return false
    }
    const isMergedLeaf = isLeaf(option, fieldNames)

    return !optionDisabled && (isMergedLeaf || context.value?.changeOnSelect || props.multiple)
  }

  const onPathSelect = (valuePath: SingleValueType, leaf: boolean, fromKeyboard = false) => {
    context.value?.onSelect(valuePath)

    if (!props.multiple
      && (leaf || (context.value?.changeOnSelect && (context.value?.expandTrigger === 'hover' || fromKeyboard)))) {
      props.toggleOpen(false)
    }
  }

  // ========================== Option ==========================
  const mergedOptions = computed(() => {
    if (props.searchValue) {
      return context.value?.searchOptions || []
    }

    return context.value?.options || []
  })

  // ========================== Column ==========================
  const optionColumns = computed(() => {
    const fieldNames = mergedFieldNames.value
    if (!fieldNames) {
      return []
    }

    const optionList: { options: DefaultOptionType[] }[] = [{ options: mergedOptions.value }]
    let currentList = mergedOptions.value

    const fullPathKeys = getFullPathKeys(currentList, fieldNames)

    for (let i = 0; i < activeValueCells.value.length; i += 1) {
      const activeValueCell = activeValueCells.value[i]
      const currentOption = currentList.find(
        (option, index) =>
          (fullPathKeys[index] ? toPathKey(fullPathKeys[index]) : option[fieldNames.value])
          === activeValueCell,
      )

      const subOptions = currentOption?.[fieldNames.children]
      if (!subOptions?.length) {
        break
      }

      currentList = subOptions
      optionList.push({ options: subOptions })
    }

    return optionList
  })

  // ========================= Keyboard =========================
  const onKeyboardSelect = (selectValueCells: SingleValueType, option: DefaultOptionType) => {
    if (isSelectable(option) && mergedFieldNames.value) {
      onPathSelect(selectValueCells, isLeaf(option, mergedFieldNames.value), true)
    }
  }

  const keyboardConfig = useKeyboard(
    mergedOptions as ComputedRef<DefaultOptionType[]>,
    mergedFieldNames as ComputedRef<any>,
    activeValueCells,
    onPathOpen,
    onKeyboardSelect,
    {
      direction: computed(() => props.direction),
      searchValue: computed(() => props.searchValue || ''),
      toggleOpen: props.toggleOpen,
      open: computed(() => props.open),
    },
  )

  expose(keyboardConfig)

  // >>>>> Active Scroll
  watch(
    [() => activeValueCells.value, () => props.searchValue],
    () => {
      if (props.searchValue) {
        return
      }
      nextTick(() => {
        for (let i = 0; i < activeValueCells.value.length; i += 1) {
          const cellPath = activeValueCells.value.slice(0, i + 1)
          const cellKeyPath = toPathKey(cellPath as SingleValueType)
          const ele = containerRef.value?.querySelector<HTMLElement>(
            `li[data-path-key="${cellKeyPath.replace(/\\{0,2}"/g, '\\\"')}"]`,
          )
          if (ele) {
            scrollIntoParentView(ele)
          }
        }
      })
    },
    { deep: true },
  )

  // ========================== Render ==========================
  return () => {
    const fieldNames = mergedFieldNames.value
    if (!fieldNames) {
      return null
    }

    // >>>>> Empty
    const isEmpty = !optionColumns.value[0]?.options?.length

    const emptyList: DefaultOptionType[] = [
      {
        [fieldNames.value as 'value']: '__EMPTY__',
        [FIX_LABEL as 'label']: props.notFoundContent,
        disabled: true,
      } as DefaultOptionType,
    ]

    const columnProps = {
      ...props,
      multiple: !isEmpty && props.multiple,
      onSelect: onPathSelect,
      onActive: onPathOpen,
      onToggleOpen: props.toggleOpen,
      checkedSet: checkedSet.value,
      halfCheckedSet: halfCheckedSet.value,
      loadingKeys: loadingKeys.value,
      isSelectable,
    }

    // >>>>> Columns
    const mergedOptionColumns = isEmpty ? [{ options: emptyList }] : optionColumns.value

    const columnNodes = mergedOptionColumns.map((col, index) => {
      const prevValuePath = activeValueCells.value.slice(0, index)
      const activeValue = activeValueCells.value[index]

      return (
        <Column
          key={index}
          {...columnProps as any}
          prefixCls={mergedPrefixCls.value}
          options={col.options}
          prevValuePath={prevValuePath}
          activeValue={activeValue}
        />
      )
    })

    return (
      <CacheContent open={props.open}>
        <div
          class={clsx(`${mergedPrefixCls.value}-menus`, {
            [`${mergedPrefixCls.value}-menu-empty`]: isEmpty,
            [`${mergedPrefixCls.value}-rtl`]: rtl.value,
          })}
          ref={containerRef}
        >
          {columnNodes}
        </div>
      </CacheContent>
    )
  }
})

export default RawOptionList
