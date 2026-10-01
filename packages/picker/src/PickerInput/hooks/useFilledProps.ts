import type { ComputedRef, Ref } from 'vue'
import type { FormatType, InternalMode, PickerMode } from '../../interface'
import type { RangePickerProps } from '../RangePicker'
import type { PickerProps } from '../SinglePicker'
import { isVueRenderable, warning } from '@v-c/util'
import { computed, toRef } from 'vue'
import useLocale from '../../hooks/useLocale'
import { fillShowTimeConfig, getTimeProps } from '../../hooks/useTimeConfig'
import { isSameTimestamp } from '../../utils/dateUtil'
import { pickProps, toArray } from '../../utils/miscUtil'
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

// Stable fallbacks so getter refs do not hand out a fresh `{}` on every read.
const EMPTY_STYLES = {}
const EMPTY_CLASS_NAMES = {}

function useList<T, M = T>(
  value: Ref<T | T[] | undefined>,
  fillMode = false,
  transform?: (item: T) => M,
  isSameItem?: (prev: M, next: M) => boolean,
) {
  // React `useList` memoizes on the raw `value` prop only, so an unrelated
  // re-render never produces a new array. The Vue computed also tracks the
  // transform deps (locale/generateConfig), so keep the previous array when
  // items are equivalent to avoid downstream watchers resetting draft state.
  let cache: M[] | undefined
  return computed(() => {
    const val = value.value
    let list
      = val === null || val === undefined
        ? val
        : toArray(val).map(item => (transform ? transform(item) : item))

    if (fillMode && list && Array.isArray(list)) {
      const clone = [...list]
      clone[1] = clone[1] || clone[0]
      list = clone
    }

    if (isSameItem && cache && Array.isArray(list)
      && cache.length === list.length
      && list.every((item, index) => item === cache![index] || isSameItem(cache![index], item as M))
    ) {
      return cache
    }

    cache = Array.isArray(list) ? (list as M[]) : undefined
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
 *
 * Plain field reads are exposed as `toRef(getter)` refs (no computed
 * bookkeeping); only values that build new objects or run side effects stay
 * as computeds.
 */
export default function useFilledProps<
  InProps extends PickedProps,
  DateType extends GetGeneric<InProps>,
  UpdaterProps extends object,
>(
  props: Ref<InProps>,
  updater?: () => UpdaterProps,
): [
  filledProps: ComputedRef<FilledProps<InProps, DateType, UpdaterProps>>,
  internalPicker: Ref<InternalMode>,
  complexPicker: Ref<boolean | undefined>,
  formatList: ComputedRef<FormatType<DateType>[]>,
  maskFormat: ComputedRef<string | undefined>,
  isInvalidateDate: ReturnType<UseInvalidate<DateType>>,
] {
  // Default Values
  const mergedPicker = toRef(() => props.value.picker || 'date')
  const mergedPrefixCls = toRef(() => props.value.prefixCls || 'vc-picker')
  const mergedPreviewValue = toRef(() => props.value.previewValue ?? 'hover')
  const mergedStyles = toRef(() => props.value.styles || EMPTY_STYLES)
  const mergedClassNames = toRef(() => props.value.classNames || EMPTY_CLASS_NAMES)
  const mergedOrder = toRef(() => props.value.order ?? true)
  const mergedComponents = computed(() => ({
    input: props.value.inputRender,
    ...props.value.components,
  }))

  // ======================== Picker ========================
  /** Almost same as `picker`, but add `datetime` for `date` with `showTime` */
  const internalPicker = toRef((): InternalMode =>
    mergedPicker.value === 'date' && props.value.showTime
      ? 'datetime'
      : mergedPicker.value,
  )

  /** The picker is `datetime` or `time` */
  const multipleInteractivePicker = toRef(
    () =>
      internalPicker.value === 'time' || internalPicker.value === 'datetime',
  )
  const complexPicker = toRef(
    (): boolean | undefined => multipleInteractivePicker.value || (props.value as any).multiple,
  )

  const mergedNeedConfirm = toRef(
    () => {
      return props.value.needConfirm ?? multipleInteractivePicker.value
    },
  )

  // ========================== Time ==========================
  // Auto `format` need to check `showTime.showXXX` first.
  // And then merge the `locale` into `mergedShowTime`.
  const timePropsInfo = computed(() => getTimeProps(props.value as any))

  // [timeProps, localeTimeProps, showTimeFormat, propFormat]
  const timeProps = toRef(() => timePropsInfo.value[0])
  const localeTimeProps = toRef(() => timePropsInfo.value[1])
  const showTimeFormat = toRef(() => timePropsInfo.value[2])
  const propFormat = toRef(() => timePropsInfo.value[3])

  // ======================= Locales ========================
  const mergedLocale = useLocale(
    toRef(() => props.value.locale),
    localeTimeProps,
  )
  const valueFormat = toRef(() => (props.value as any).valueFormat)

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

  const isSameParsedDate = (prev: any, next: any) =>
    isSameTimestamp(props.value.generateConfig, prev, next)

  const values = useList(toRef(() => props.value.value), false, parseByValueFormat, isSameParsedDate)
  const defaultValues = useList(toRef(() => props.value.defaultValue), false, parseByValueFormat, isSameParsedDate)
  const pickerValues = useList(toRef(() => props.value.pickerValue), false, parseByValueFormat, isSameParsedDate)
  const defaultPickerValues = useList(
    toRef(() => props.value.defaultPickerValue),
    false,
    parseByValueFormat,
    isSameParsedDate,
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

  // ======================== Suffix ========================
  // Kept as a computed so the deprecation warning fires once per change, not per read.
  const mergedSuffix = computed(() => {
    const { suffix, suffixIcon } = props.value

    if (process.env.NODE_ENV !== 'production' && isVueRenderable(suffixIcon)) {
      warning(false, '`suffixIcon` is deprecated. Please use `suffix` instead.')
    }

    return suffix ?? suffixIcon
  })

  // ======================== Props =========================
  const filledProps = computed(() => ({
    // Only forward props that are actually set: every downstream layer
    // (omit / pickAttrs / child initProps) is proportional to the key count.
    ...pickProps(props.value as any),
    previewValue: mergedPreviewValue.value,
    prefixCls: mergedPrefixCls.value,
    locale: mergedLocale.value,
    picker: mergedPicker.value,
    styles: mergedStyles.value,
    classNames: mergedClassNames.value,
    order: mergedOrder.value,
    components: mergedComponents.value,
    suffix: mergedSuffix.value,
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
    toRef(() => props.value.format),
  )

  // ======================= ReadOnly =======================
  const mergedInputReadOnly = useInputReadOnly(
    formatList,
    toRef(() => props.value.inputReadOnly),
    toRef(() => (props.value as any).multiple),
  )

  // ======================= Boundary =======================
  const disabledBoundaryDate = useDisabledBoundary(
    toRef(() => props.value.generateConfig),
    toRef(() => props.value.locale),
    toRef(() => props.value.disabledDate),
    toRef(() => props.value.minDate),
    toRef(() => props.value.maxDate),
  )

  // ====================== Invalidate ======================
  const isInvalidateDate = useInvalidate(
    toRef(() => props.value.generateConfig),
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
