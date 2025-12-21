import type { Ref } from 'vue'
import type { InternalMode } from '../../interface'
import { warning } from '@v-c/util'
import { computed, toRefs } from 'vue'
import useLocale from '../../hooks/useLocale'
import { fillShowTimeConfig, getTimeProps } from '../../hooks/useTimeConfig'
import { toArray } from '../../utils/miscUtil'
import { fillClearIcon } from '../Selector/hooks/useClearIcon'
import useDisabledBoundary from './useDisabledBoundary'
import { useFieldFormat } from './useFieldFormat'
import useInputReadOnly from './useInputReadOnly'
import useInvalidate from './useInvalidate'

interface PickedProps<DateType extends object = any> {
  generateConfig?: any
  locale?: any
  picker?: any
  prefixCls?: any
  styles?: any
  classNames?: any
  order?: any
  components?: any
  inputRender?: any
  clearIcon?: any
  allowClear?: any
  needConfirm?: any
  format?: any
  inputReadOnly?: any
  disabledDate?: any
  minDate?: any
  maxDate?: any
  defaultOpenValue?: any
  previewValue?: any
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
) {
  const {
    generateConfig,
    locale,
    picker,
    prefixCls,
    previewValue,
    styles,
    classNames,
    order,
    components,
    inputRender,
    allowClear,
    clearIcon,
    needConfirm,
    multiple,
    format,
    inputReadOnly,
    disabledDate,
    minDate,
    maxDate,
    showTime,
    value,
    defaultValue,
    pickerValue,
    defaultPickerValue,
  } = toRefs(props)

  // Default Values
  const mergedPicker = computed(() => picker?.value || 'date')
  const mergedPrefixCls = computed(() => prefixCls?.value || 'rc-picker')
  const mergedPreviewValue = computed(() => previewValue?.value || 'hover')
  const mergedStyles = computed(() => styles?.value || {})
  const mergedClassNames = computed(() => classNames?.value || {})
  const mergedOrder = computed(() => order?.value ?? true)
  const mergedComponents = computed(() => ({ input: inputRender?.value, ...components?.value }))

  const values = useList(value)
  const defaultValues = useList(defaultValue)
  const pickerValues = useList(pickerValue)
  const defaultPickerValues = useList(defaultPickerValue)

  // ======================== Picker ========================
  /** Almost same as `picker`, but add `datetime` for `date` with `showTime` */
  const internalPicker = computed<InternalMode>(() =>
    mergedPicker.value === 'date' && showTime?.value ? 'datetime' : mergedPicker.value,
  )

  /** The picker is `datetime` or `time` */
  const multipleInteractivePicker = computed(() => internalPicker.value === 'time' || internalPicker.value === 'datetime')
  const complexPicker = computed(() => multipleInteractivePicker.value || multiple?.value)
  const mergedNeedConfirm = computed(() => needConfirm?.value ?? multipleInteractivePicker.value)

  // ========================== Time ==========================
  // Auto `format` need to check `showTime.showXXX` first.
  // And then merge the `locale` into `mergedShowTime`.
  const timePropsInfo = computed(() => getTimeProps({
    ...props,
    picker: internalPicker.value,
  }))

  // [timeProps, localeTimeProps, showTimeFormat, propFormat]
  const timeProps = computed(() => timePropsInfo.value[0])
  const localeTimeProps = computed(() => timePropsInfo.value[1])
  const showTimeFormat = computed(() => timePropsInfo.value[2])
  const propFormat = computed(() => timePropsInfo.value[3])

  // ======================= Locales ========================
  const mergedLocale = useLocale(locale?.value, localeTimeProps)

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
    clearIcon: fillClearIcon(mergedPrefixCls.value, allowClear?.value, clearIcon?.value),
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
    format,
  )

  // ======================= ReadOnly =======================
  const mergedInputReadOnly = useInputReadOnly(formatList, inputReadOnly, multiple)

  // ======================= Boundary =======================
  const disabledBoundaryDate = useDisabledBoundary(
    generateConfig,
    mergedLocale,
    disabledDate,
    minDate,
    maxDate,
  )

  // ====================== Invalidate ======================
  const isInvalidateDate = useInvalidate(
    generateConfig,
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
    mergedProps,
    internalPicker,
    complexPicker,
    formatList,
    maskFormat,
    isInvalidateDate,
  ] as const
}
