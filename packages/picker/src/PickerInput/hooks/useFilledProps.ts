import type { ComputedRef, Ref } from 'vue'
import type { FormatType, InternalMode, PickerMode } from '../../interface'
import type { RangePickerProps } from '../RangePicker'
import type { PickerProps } from '../SinglePicker'
import { warning } from '@v-c/util'
import { computed } from 'vue'
import useLocale from '../../hooks/useLocale'
import { fillShowTimeConfig, getTimeProps } from '../../hooks/useTimeConfig'
import { toArray } from '../../utils/miscUtil'
import { parseValue } from '../../utils/valueUtil'
import { fillClearIcon } from '../Selector/hooks/useClearIcon'
import useDisabledBoundary from './useDisabledBoundary'
import { useFieldFormat } from './useFieldFormat'
import useInputReadOnly from './useInputReadOnly'
import useInvalidate from './useInvalidate'

type UseInvalidate<DateType extends object = any>
  = typeof useInvalidate<DateType>

type PickedProps<DateType extends object = any>
  = | RangePickerProps<DateType>
    | PickerProps<DateType>

type ExcludeBooleanType<T> = T extends boolean ? never : T

type GetGeneric<T> = T extends PickedProps<infer U> ? U : never

type ToArrayType<T, DateType> = T extends any[] ? T : DateType[]

function useList<T, M = T>(
  value: Ref<T | T[] | undefined>,
  fillMode = false,
  transform?: (item: T) => M,
) {
  return computed(() => {
    const val = value.value
    const list
      = val === null || val === undefined
        ? val
        : toArray(val).map(item => (transform ? transform(item) : item))

    if (fillMode && list && Array.isArray(list)) {
      const clone = [...list]
      clone[1] = clone[1] || clone[0]
      return clone
    }

    return list
  })
}

type FilledProps<
  InProps extends PickedProps,
  DateType extends GetGeneric<InProps>,
  UpdaterProps extends object = object,
> = Omit<InProps, keyof UpdaterProps | 'showTime' | 'value' | 'defaultValue'>
  & UpdaterProps & {
    picker: PickerMode
    showTime?: ExcludeBooleanType<InProps['showTime']>
    value?: ToArrayType<InProps['value'], DateType>
    defaultValue?: ToArrayType<InProps['value'], DateType>
    pickerValue?: ToArrayType<InProps['value'], DateType>
    defaultPickerValue?: ToArrayType<InProps['value'], DateType>
  }

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
  props: ComputedRef<InProps>,
  updater?: () => UpdaterProps,
): [
  filledProps: ComputedRef<FilledProps<InProps, DateType, UpdaterProps>>,
  internalPicker: ComputedRef<InternalMode>,
  complexPicker: ComputedRef<boolean | undefined>,
  formatList: ComputedRef<FormatType<DateType>[]>,
  maskFormat: ComputedRef<string | undefined>,
  isInvalidateDate: ReturnType<UseInvalidate<DateType>>,
] {
  // Default Values
  const mergedPicker = computed(() => props.value.picker || 'date')
  const mergedPrefixCls = computed(() => props.value.prefixCls || 'vc-picker')
  const mergedPreviewValue = computed(() => props.value.previewValue ?? 'hover')
  const mergedStyles = computed(() => props.value.styles || {})
  const mergedClassNames = computed(() => props.value.classNames || {})
  const mergedOrder = computed(() => props.value.order ?? true)
  const mergedComponents = computed(() => ({
    input: props.value.inputRender,
    ...props.value.components,
  }))

  // ======================== Picker ========================
  /** Almost same as `picker`, but add `datetime` for `date` with `showTime` */
  const internalPicker = computed<InternalMode>(() =>
    mergedPicker.value === 'date' && props.value.showTime
      ? 'datetime'
      : mergedPicker.value,
  )

  /** The picker is `datetime` or `time` */
  const multipleInteractivePicker = computed(
    () =>
      internalPicker.value === 'time' || internalPicker.value === 'datetime',
  )
  const complexPicker = computed(
    () => multipleInteractivePicker.value || (props.value as any).multiple,
  )

  const mergedNeedConfirm = computed(
    () => {
      return props.value.needConfirm ?? multipleInteractivePicker.value
    },
  )

  // ========================== Time ==========================
  // Auto `format` need to check `showTime.showXXX` first.
  // And then merge the `locale` into `mergedShowTime`.
  const timePropsInfo = computed(() => getTimeProps(props.value as any))

  // [timeProps, localeTimeProps, showTimeFormat, propFormat]
  const timeProps = computed(() => timePropsInfo.value[0])
  const localeTimeProps = computed(() => timePropsInfo.value[1])
  const showTimeFormat = computed(() => timePropsInfo.value[2])
  const propFormat = computed(() => timePropsInfo.value[3])

  // ======================= Locales ========================
  const mergedLocale = useLocale(
    computed(() => props.value.locale),
    localeTimeProps,
  )
  const valueFormat = computed(() => (props.value as any).valueFormat)

  const parseByValueFormat = (val: any) =>
    parseValue(val, {
      generateConfig: props.value.generateConfig,
      locale: mergedLocale.value,
      valueFormat: valueFormat.value,
    })

  const mergedShowTime = computed(() =>
    fillShowTimeConfig(
      internalPicker.value,
      showTimeFormat.value,
      propFormat.value,
      timeProps.value,
      mergedLocale.value,
    ),
  )

  const values = useList(computed(() => props.value.value), false, parseByValueFormat)
  const defaultValues = useList(computed(() => props.value.defaultValue), false, parseByValueFormat)
  const pickerValues = useList(computed(() => props.value.pickerValue), false, parseByValueFormat)
  const defaultPickerValues = useList(
    computed(() => props.value.defaultPickerValue),
    false,
    parseByValueFormat,
  )

  // ======================= Warning ========================
  if (process.env.NODE_ENV !== 'production') {
    // Watch effect for warning? Or just check once?
    // In Vue setup runs once.
    if (mergedPicker.value === 'time') {
      if (
        ['disabledHours', 'disabledMinutes', 'disabledSeconds'].some(
          key => (props as any)[key],
        )
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
    ...props.value,
    previewValue: mergedPreviewValue.value,
    prefixCls: mergedPrefixCls.value,
    locale: mergedLocale.value,
    picker: mergedPicker.value,
    styles: mergedStyles.value,
    classNames: mergedClassNames.value,
    order: mergedOrder.value,
    components: mergedComponents.value,
    clearIcon: fillClearIcon(
      mergedPrefixCls.value,
      props.value.allowClear,
      props.value.clearIcon,
    ),
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
    computed(() => props.value.format),
  )

  // ======================= ReadOnly =======================
  const mergedInputReadOnly = useInputReadOnly(
    formatList,
    computed(() => props.value.inputReadOnly),
    computed(() => (props.value as any).multiple),
  )

  // ======================= Boundary =======================
  const disabledBoundaryDate = useDisabledBoundary(
    computed(() => props.value.generateConfig),
    computed(() => props.value.locale),
    computed(() => props.value.disabledDate),
    computed(() => props.value.minDate),
    computed(() => props.value.maxDate),
  )

  // ====================== Invalidate ======================
  const isInvalidateDate = useInvalidate(
    computed(() => props.value.generateConfig),
    mergedPicker,
    disabledBoundaryDate as any, // useDisabledBoundary returns a function, which is compatible with DisabledDate
    mergedShowTime,
  )

  // ======================== Merged ========================
  const mergedProps: ComputedRef<FilledProps<InProps, DateType, UpdaterProps>>
    = computed(() => {
      const target = {
        ...filledProps.value,
        needConfirm: mergedNeedConfirm.value,
        inputReadOnly: mergedInputReadOnly.value,
        disabledDate: disabledBoundaryDate,
      }
      return target as unknown as FilledProps<InProps, DateType, UpdaterProps>
    })

  return [
    mergedProps,
    internalPicker,
    complexPicker,
    formatList,
    maskFormat,
    isInvalidateDate,
  ] as const
}
