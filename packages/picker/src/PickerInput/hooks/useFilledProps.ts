import type { ComputedRef, Ref } from 'vue'
import type { FormatType, InternalMode, PickerMode } from '../../interface'
import type { RangePickerProps } from '../RangePicker'
import { warning } from '@v-c/util'
import { computed } from 'vue'
import useLocale from '../../hooks/useLocale'
import { fillShowTimeConfig, getTimeProps } from '../../hooks/useTimeConfig'
import { toArray } from '../../utils/miscUtil'
import { fillClearIcon } from '../Selector/hooks/useClearIcon'
import useDisabledBoundary from './useDisabledBoundary'
import { useFieldFormat } from './useFieldFormat'
import useInputReadOnly from './useInputReadOnly'
import useInvalidate from './useInvalidate'

type UseInvalidate<DateType extends object = any> = typeof useInvalidate<DateType>

type PickedProps<DateType extends object = any> = Pick<
  RangePickerProps<DateType>,
  | 'generateConfig'
  | 'locale'
  | 'picker'
  | 'prefixCls'
  | 'styles'
  | 'classNames'
  | 'order'
  | 'components'
  | 'inputRender'
  | 'clearIcon'
  | 'allowClear'
  | 'needConfirm'
  | 'format'
  | 'inputReadOnly'
  | 'disabledDate'
  | 'minDate'
  | 'maxDate'
  | 'defaultOpenValue'
  | 'previewValue'
> & {
  multiple?: boolean
  // RangePicker showTime definition is different with Picker
  showTime?: any
  value?: any
  defaultValue?: any
  pickerValue?: any
  defaultPickerValue?: any
}

type ExcludeBooleanType<T> = T extends boolean ? never : T

type GetGeneric<T> = T extends PickedProps<infer U> ? U : never

type ToArrayType<T, DateType> = T extends any[] ? T : DateType[]

function useList<T>(value: Ref<T | T[] | undefined>, fillMode = false) {
  return computed(() => {
    const val = value.value
    const list = val ? toArray(val) : val

    if (fillMode && list && Array.isArray(list)) {
      const clone = [...list]
      clone[1] = clone[1] || clone[0]
      return clone
    }

    return list
  })
}

type FilledProps<InProps extends PickedProps, DateType extends GetGeneric<InProps>, UpdaterProps extends object> = ComputedRef<Omit<InProps, keyof UpdaterProps | 'showTime' | 'value' | 'defaultValue'>
  & UpdaterProps & {
    picker: PickerMode
    showTime?: ExcludeBooleanType<InProps['showTime']>
    value?: ToArrayType<InProps['value'], DateType>
    defaultValue?: ToArrayType<InProps['value'], DateType>
    pickerValue?: ToArrayType<InProps['value'], DateType>
    defaultPickerValue?: ToArrayType<InProps['value'], DateType>
  }>
/**
 * Align the outer props with unique typed and fill undefined props.
 * This is shared with both RangePicker and Picker. This will do:
 * - Convert `value` & `defaultValue` to array
 * - handle the legacy props fill like `clearIcon` + `allowClear` = `clearIcon`
 */
export default function useFilledProps<
  InProps extends PickedProps,
  DateType extends GetGeneric<InProps>,
  UpdaterProps extends object,
>(
  props: InProps,
  updater?: () => UpdaterProps,
): [
  filledProps: FilledProps<InProps, DateType, UpdaterProps>,
  internalPicker: ComputedRef<InternalMode>,
  complexPicker: ComputedRef<boolean | undefined>,
  formatList: ComputedRef<FormatType<DateType>[]>,
  maskFormat: ComputedRef<string | undefined>,
  isInvalidateDate: ReturnType<UseInvalidate<DateType>>,
] {
  // Default Values
  const mergedPicker = computed(() => props.picker || 'date')
  const mergedPrefixCls = computed(() => props.prefixCls || 'rc-picker')
  const mergedPreviewValue = computed(() => props.previewValue || 'hover')
  const mergedStyles = computed(() => props.styles || {})
  const mergedClassNames = computed(() => props.classNames || {})
  const mergedOrder = computed(() => props.order ?? true)
  const mergedComponents = computed(() => ({ input: props.inputRender, ...props.components }))

  const values = useList(computed(() => props.value))
  const defaultValues = useList(computed(() => props.defaultValue))
  const pickerValues = useList(computed(() => props.pickerValue))
  const defaultPickerValues = useList(computed(() => props.defaultPickerValue))

  // ======================== Picker ========================
  /** Almost same as `picker`, but add `datetime` for `date` with `showTime` */
  const internalPicker = computed<InternalMode>(() =>
    mergedPicker.value === 'date' && props.showTime ? 'datetime' : mergedPicker.value,
  )

  /** The picker is `datetime` or `time` */
  const multipleInteractivePicker = computed(() => internalPicker.value === 'time' || internalPicker.value === 'datetime')
  const complexPicker = computed(() => multipleInteractivePicker.value || props.multiple)
  const mergedNeedConfirm = computed(() => props.needConfirm ?? multipleInteractivePicker.value)

  // ========================== Time ==========================
  // Auto `format` need to check `showTime.showXXX` first.
  // And then merge the `locale` into `mergedShowTime`.
  const timePropsInfo = computed(() => getTimeProps(props))

  // [timeProps, localeTimeProps, showTimeFormat, propFormat]
  const timeProps = computed(() => timePropsInfo.value[0])
  const localeTimeProps = computed(() => timePropsInfo.value[1])
  const showTimeFormat = computed(() => timePropsInfo.value[2])
  const propFormat = computed(() => timePropsInfo.value[3])

  // ======================= Locales ========================
  const mergedLocale = useLocale(computed(() => props.locale), localeTimeProps)

  const mergedShowTime = computed(() =>
    fillShowTimeConfig(
      internalPicker.value,
      showTimeFormat.value,
      propFormat.value,
      timeProps.value,
      mergedLocale.value,
    ),
  )

  // ======================= Warning ========================
  if (process.env.NODE_ENV !== 'production') {
    // Watch effect for warning? Or just check once?
    // In Vue setup runs once.
    if (mergedPicker.value === 'time') {
      if (
        ['disabledHours', 'disabledMinutes', 'disabledSeconds'].some(key => (props as any)[key])
      ) {
        warning(
          false,
          `'disabledHours', 'disabledMinutes', 'disabledSeconds' will be removed in the next major version, please use 'disabledTime' instead.`,
        )
      }
    }
  }

  // ======================== Props =========================
  const filledProps = computed(() => ({
    ...props,
    previewValue: mergedPreviewValue.value,
    prefixCls: mergedPrefixCls.value,
    locale: mergedLocale.value,
    picker: mergedPicker.value,
    styles: mergedStyles.value,
    classNames: mergedClassNames.value,
    order: mergedOrder.value,
    components: mergedComponents.value,
    clearIcon: fillClearIcon(mergedPrefixCls.value, props.allowClear, props.clearIcon),
    showTime: mergedShowTime.value,
    value: values.value,
    defaultValue: defaultValues.value,
    pickerValue: pickerValues.value,
    defaultPickerValue: defaultPickerValues.value,
    ...updater?.(),
  }))

  // ======================== Format ========================
  const [formatList, maskFormat] = useFieldFormat<DateType>(
    internalPicker,
    mergedLocale,
    computed(() => props.format),
  )

  // ======================= ReadOnly =======================
  const mergedInputReadOnly = useInputReadOnly(
    formatList,
    computed(() => props.inputReadOnly),
    computed(() => props.multiple),
  )

  // ======================= Boundary =======================
  const disabledBoundaryDate = useDisabledBoundary(
    computed(() => props.generateConfig),
    computed(() => props.locale),
    computed(() => props.disabledDate),
    computed(() => props.minDate),
    computed(() => props.maxDate),
  )

  // ====================== Invalidate ======================
  const isInvalidateDate = useInvalidate(
    computed(() => props.generateConfig),
    mergedPicker,
    disabledBoundaryDate as any, // useDisabledBoundary returns a function, which is compatible with DisabledDate
    mergedShowTime,
  )

  // ======================== Merged ========================
  const mergedProps = computed(() => ({
    ...filledProps.value,
    needConfirm: mergedNeedConfirm.value,
    inputReadOnly: mergedInputReadOnly.value,
    disabledDate: disabledBoundaryDate,
  }))

  return [
    mergedProps as unknown as FilledProps<InProps, DateType, UpdaterProps>,
    internalPicker,
    complexPicker,
    formatList,
    maskFormat,
    isInvalidateDate,
  ] as const
}
