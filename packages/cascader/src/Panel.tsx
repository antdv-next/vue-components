import type { CSSProperties } from 'vue'
import type {
  CascaderProps,
  DefaultOptionType,
  InternalValueType,
  SingleValueType,
} from './Cascader'
import { clsx } from '@v-c/util'
import useEvent from '@v-c/util/dist/hooks/useEvent'
import { computed, defineComponent, shallowRef, watch } from 'vue'
import { useCascaderProvider } from './context'
import useMissingValues from './hooks/useMissingValues'
import useOptions from './hooks/useOptions'
import useSelect from './hooks/useSelect'
import useValues from './hooks/useValues'
import RawOptionList from './OptionList/List'
import { fillFieldNames, SHOW_PARENT, toRawValues } from './utils/commonUtil'
import { toPathOptions } from './utils/treeUtil'

export type PickType
  = | 'value'
    | 'defaultValue'
    | 'changeOnSelect'
    | 'onChange'
    | 'options'
    | 'prefixCls'
    | 'checkable'
    | 'fieldNames'
    | 'showCheckedStrategy'
    | 'loadData'
    | 'expandTrigger'
    | 'expandIcon'
    | 'loadingIcon'
    | 'className'
    | 'style'
    | 'direction'
    | 'notFoundContent'
    | 'disabled'
    | 'optionRender'

export type PanelProps<
  OptionType extends DefaultOptionType = DefaultOptionType,
  ValueField extends keyof OptionType = keyof OptionType,
  Multiple extends boolean | any = false,
  // @ts-expect-error this
> = Pick<CascaderProps<OptionType, ValueField, Multiple>, PickType>

function noop() {}

const panelDefaults: PanelProps = {
  prefixCls: 'vc-cascader',
  expandIcon: '>',
  showCheckedStrategy: SHOW_PARENT,
  notFoundContent: 'Not Found',
}

const Panel = defineComponent<PanelProps>((props = panelDefaults) => {
  // ======================== Multiple ========================
  const multiple = computed(() => !!props.checkable)
  const mergedShowCheckedStrategy = computed(
    () => props.showCheckedStrategy ?? panelDefaults.showCheckedStrategy,
  )

  // ========================= Values =========================
  const internalRawValues = shallowRef(props?.value ?? props?.defaultValue)
  watch(() => props.value, () => {
    internalRawValues.value = props?.value
  })
  const setRawValues = (values: InternalValueType) => {
    internalRawValues.value = values as any
  }

  const rawValues = computed(() => toRawValues(internalRawValues.value as any))

  // ========================= FieldNames =========================
  const mergedFieldNames = computed(() => fillFieldNames(props.fieldNames))

  // =========================== Option ===========================
  const [mergedOptions, getPathKeyEntities, getValueByKeyPath] = useOptions(
    mergedFieldNames,
    computed(() => props.options as DefaultOptionType[] | undefined),
  )

  // ========================= Values =========================
  const getMissingValues = useMissingValues(mergedOptions, mergedFieldNames)

  // Fill `rawValues` with checked conduction values
  const valuesInfo = useValues(
    multiple,
    rawValues,
    getPathKeyEntities,
    getValueByKeyPath,
    getMissingValues,
  )

  const checkedValues = computed(() => valuesInfo.value[0])
  const halfCheckedValues = computed(() => valuesInfo.value[1])
  const missingCheckedValues = computed(() => valuesInfo.value[2])

  // =========================== Change ===========================
  const triggerChange = useEvent((nextValues: InternalValueType) => {
    setRawValues(nextValues)

    // Save perf if no need trigger event
    if (props.onChange) {
      const nextRawValues = toRawValues(nextValues)

      const valueOptions = nextRawValues.map(valueCells =>
        toPathOptions(valueCells, mergedOptions.value, mergedFieldNames.value).map(
          valueOpt => valueOpt.option,
        ),
      )

      const triggerValues = multiple.value ? nextRawValues : nextRawValues[0]
      const triggerOptions = multiple.value ? valueOptions : valueOptions[0]

      props.onChange(triggerValues as any, triggerOptions as any)
    }
  })

  // =========================== Select ===========================
  const handleSelection = useSelect(
    multiple,
    triggerChange,
    checkedValues,
    halfCheckedValues,
    missingCheckedValues,
    getPathKeyEntities,
    getValueByKeyPath,
    mergedShowCheckedStrategy,
  )

  const onInternalSelect = useEvent((valuePath: SingleValueType) => {
    handleSelection(valuePath)
  })

  // ======================== Context =========================
  const cascaderContext = computed(() => ({
    options: mergedOptions.value,
    fieldNames: mergedFieldNames.value,
    values: checkedValues.value,
    halfValues: halfCheckedValues.value,
    changeOnSelect: props.changeOnSelect,
    onSelect: onInternalSelect,
    checkable: props.checkable,
    searchOptions: [],
    popupPrefixCls: undefined,
    loadData: props.loadData,
    expandTrigger: props.expandTrigger,
    expandIcon: props.expandIcon !== undefined ? props.expandIcon : panelDefaults.expandIcon,
    loadingIcon: props.loadingIcon,
    popupMenuColumnStyle: undefined,
    optionRender: props.optionRender,
  }))

  useCascaderProvider(cascaderContext)

  // ========================= Render =========================
  return () => {
    const panelPrefixCls = `${props.prefixCls ?? panelDefaults.prefixCls}-panel`
    const isEmpty = !mergedOptions.value.length

    return (
      <div
        class={clsx(
          panelPrefixCls,
          {
            [`${panelPrefixCls}-rtl`]: props.direction === 'rtl',
            [`${panelPrefixCls}-empty`]: isEmpty,
          },
          props.className,
        )}
        style={props.style as CSSProperties}
      >
        {isEmpty
          ? (props.notFoundContent ?? panelDefaults.notFoundContent)
          : (
              <RawOptionList
                prefixCls={props.prefixCls ?? panelDefaults.prefixCls!}
                searchValue=""
                multiple={multiple.value}
                toggleOpen={noop}
                open
                direction={props.direction}
                disabled={props.disabled}
              />
            )}
      </div>
    )
  }
}) as unknown as (<
  OptionType extends DefaultOptionType = DefaultOptionType,
  ValueField extends keyof OptionType = keyof OptionType,
  Multiple extends boolean | any = false,
>(
  props: PanelProps<OptionType, ValueField, Multiple>,
) => any)

export default Panel
