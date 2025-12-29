import type { VueNode } from '@v-c/util/dist/type'
import type { PropType } from 'vue'
import type { BaseInfo, InternalMode, OpenConfig, PanelMode, RangeTimeProps, SharedPickerProps, ValueDate } from '../interface'
import type { PopupShowTimeConfig } from './Popup'
import type { SelectorIdType } from './Selector/RangeSelector'
import { clsx } from '@v-c/util'
import omit from '@v-c/util/dist/omit'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import warning from '@v-c/util/dist/warning'
import { computed, defineComponent, ref, watch } from 'vue'
import useSemantic from '../hooks/useSemantic'
import PickerTrigger from '../PickerTrigger'
import { pickTriggerProps } from '../PickerTrigger/util'
import { fillIndex, getFromDate, toArray } from '../utils/miscUtil'
import { providePickerContext } from './context'
import useCellRender from './hooks/useCellRender'
import useFieldsInvalidate from './hooks/useFieldsInvalidate'
import useFilledProps from './hooks/useFilledProps'
import useOpen from './hooks/useOpen'
import usePickerRef from './hooks/usePickerRef'
import usePresets from './hooks/usePresets'
import useRangeActive from './hooks/useRangeActive'
import useRangeDisabledDate from './hooks/useRangeDisabledDate'
import useRangePickerValue from './hooks/useRangePickerValue'
import useRangeValue, { useInnerValue } from './hooks/useRangeValue'
import useShowNow from './hooks/useShowNow'
import Popup from './Popup'
import RangeSelector from './Selector/RangeSelector'

export interface BaseRangePickerProps<DateType extends object>
  extends Omit<SharedPickerProps<DateType>, 'showTime' | 'id'> {
  // Structure
  id?: SelectorIdType

  separator?: VueNode

  // Value
  value?: RangeValueType<DateType> | null
  defaultValue?: RangeValueType<DateType>
  onChange?: (
    dates: NoUndefinedRangeValueType<DateType> | null,
    dateStrings: [string, string],
  ) => void
  onCalendarChange?: (
    dates: NoUndefinedRangeValueType<DateType>,
    dateStrings: [string, string],
    info: BaseInfo,
  ) => void
  onOk?: (values: NoUndefinedRangeValueType<DateType>) => void

  // Placeholder
  placeholder?: [string, string]

  // Picker Value
  /**
   * Config the popup panel date.
   * Every time active the input to open popup will reset with `defaultPickerValue`.
   *
   * Note: `defaultPickerValue` priority is higher than `value` for the first open.
   */
  defaultPickerValue?: [DateType, DateType] | DateType | null
  /**
   * Config each start & end field popup panel date.
   * When config `pickerValue`, you must also provide `onPickerValueChange` to handle changes.
   */
  pickerValue?: [DateType, DateType] | DateType | null
  /**
   * Each popup panel `pickerValue` includes `mode` change will trigger the callback.
   * @param date The changed picker value
   * @param info.source `panel` from the panel click. `reset` from popup open or field typing
   * @param info.mode Next `mode` panel
   */
  onPickerValueChange?: (
    date: [DateType, DateType],
    info: BaseInfo & {
      source: 'reset' | 'panel'
      mode: [PanelMode, PanelMode]
    },
  ) => void

  // Preset
  presets?: ValueDate<Exclude<RangeValueType<DateType>, null>>[]
  /** @deprecated Please use `presets` instead */
  ranges?: Record<
    string,
    Exclude<RangeValueType<DateType>, null> | (() => Exclude<RangeValueType<DateType>, null>)
  >

  // Control
  disabled?: boolean | [boolean, boolean]
  allowEmpty?: boolean | [boolean, boolean]

  // Time
  showTime?: boolean | RangeTimeProps<DateType>

  // Mode
  mode?: [startMode: PanelMode, endMode: PanelMode]
  /** Trigger on each `mode` or `pickerValue` changed. */
  onPanelChange?: (
    values: NoUndefinedRangeValueType<DateType>,
    modes: [startMode: PanelMode, endMode: PanelMode],
  ) => void
}

export interface RangePickerProps<DateType extends object>
  extends BaseRangePickerProps<DateType>,
  Omit<RangeTimeProps<DateType>, 'format' | 'defaultValue' | 'defaultOpenValue'> {}

function separateConfig<T>(config: T | [T, T] | null | undefined, defaultConfig: T): [T, T] {
  const singleConfig = config ?? defaultConfig

  if (Array.isArray(singleConfig)) {
    return singleConfig as [T, T]
  }

  return [singleConfig, singleConfig]
}

export type RangeValueType<DateType> = [
  start: DateType | null | undefined,
  end: DateType | null | undefined,
]

export type NoUndefinedRangeValueType<DateType> = [start: DateType | null, end: DateType | null]

function getActiveRange(activeIndex: number) {
  return activeIndex === 1 ? 'end' : 'start'
}

export default defineComponent({
  name: 'RangePicker',
  inheritAttrs: false,
  props: {
    prefixCls: String,
    id: [String, Object] as PropType<SelectorIdType>,
    popupElement: Object,
    popupStyle: Object,
    transitionName: String,
    getPopupContainer: Function,
    popupAlign: Object,
    range: { type: Boolean, default: undefined },
    popupClassName: String,
    placement: String,
    builtinPlacements: Object,
    direction: String,
    visible: { type: Boolean, default: undefined },
    onClose: Function,

    // SharedPickerProps
    locale: Object,
    generateConfig: Object,
    picker: String,
    value: Array,
    defaultValue: Array,
    onChange: Function,
    onCalendarChange: Function,
    onOk: Function,
    placeholder: [String, Array],
    defaultPickerValue: [Object, Array],
    pickerValue: [Object, Array],
    onPickerValueChange: Function,
    presets: Array,
    ranges: Object,
    disabled: { type: [Boolean, Array], default: undefined },
    allowEmpty: { type: [Boolean, Array], default: undefined },
    mode: Array,
    onPanelChange: Function,
    format: [String, Array, Function],
    inputReadOnly: { type: Boolean, default: undefined },
    suffixIcon: Object,
    separator: Object,
    removeIcon: Object,
    onFocus: Function,
    onBlur: Function,
    onClick: Function,
    components: Object,
    cellRender: Function,
    dateRender: Function,
    monthCellRender: Function,
    panelRender: Function,

    // ... other props like showTime, etc.
    showTime: { type: [Boolean, Object], default: undefined },
    showNow: { type: Boolean, default: undefined },
    showToday: { type: Boolean, default: undefined },
    defaultOpen: { type: Boolean, default: undefined },
    open: { type: Boolean, default: undefined },
    onOpenChange: Function,
    className: String,
    style: Object,
    styles: Object,
    classNames: Object,
    previewValue: String,
    order: { type: Boolean, default: undefined },
    needConfirm: { type: Boolean, default: undefined },
    allowClear: { type: [Boolean, Object], default: undefined },
    clearIcon: Object,
    multiple: { type: Boolean, default: undefined },
    maxTagCount: [Number, String],
    disabledDate: Function,
    minDate: Object,
    maxDate: Object,
    defaultOpenValue: Array,
    inputRender: Function,
  },
  setup(props, { expose }) {
    // ========================= Prop =========================
    const [filledProps, internalPicker, complexPicker, formatList, maskFormat, isInvalidateDate]
      = useFilledProps(props as any, () => {
        const { disabled, allowEmpty } = props

        const mergedDisabled = separateConfig(disabled, false)
        const mergedAllowEmpty = separateConfig(allowEmpty, false)

        return {
          disabled: mergedDisabled,
          allowEmpty: mergedAllowEmpty,
        }
      })

    const fp = computed(() => filledProps.value)

    const prefixCls = computed(() => fp.value.prefixCls)
    const rootClassName = computed(() => fp.value.rootClassName)
    const styles = computed(() => fp.value.styles)
    const classNames = computed(() => fp.value.classNames)
    const previewValue = computed(() => fp.value.previewValue)
    const defaultValue = computed(() => fp.value.defaultValue)
    const value = computed(() => fp.value.value)
    const needConfirm = computed(() => fp.value.needConfirm)
    const onKeyDown = computed(() => fp.value.onKeyDown)
    const disabled = computed(() => fp.value.disabled)
    const allowEmpty = computed(() => fp.value.allowEmpty)
    const disabledDate = computed(() => fp.value.disabledDate)
    const minDate = computed(() => fp.value.minDate)
    const maxDate = computed(() => fp.value.maxDate)
    const defaultOpen = computed(() => fp.value.defaultOpen)
    const open = computed(() => fp.value.open)
    const onOpenChange = computed(() => fp.value.onOpenChange)
    const locale = computed(() => fp.value.locale)
    const generateConfig = computed(() => fp.value.generateConfig)
    const picker = computed(() => fp.value.picker)
    const showNow = computed(() => fp.value.showNow)
    const showToday = computed(() => fp.value.showToday)
    const showTime = computed(() => fp.value.showTime)
    const mode = computed(() => fp.value.mode)
    const onPanelChange = computed(() => fp.value.onPanelChange)
    const onCalendarChange = computed(() => fp.value.onCalendarChange)
    const onOk = computed(() => fp.value.onOk)
    const defaultPickerValue = computed(() => fp.value.defaultPickerValue)
    const pickerValue = computed(() => fp.value.pickerValue)
    const onPickerValueChange = computed(() => fp.value.onPickerValueChange)
    const inputReadOnly = computed(() => fp.value.inputReadOnly)
    const suffixIcon = computed(() => fp.value.suffixIcon)
    const onFocus = computed(() => fp.value.onFocus)
    const onBlur = computed(() => fp.value.onBlur)
    const presets = computed(() => fp.value.presets)
    const ranges = computed(() => fp.value.ranges)
    const components = computed(() => fp.value.components)
    const cellRender = computed(() => fp.value.cellRender)
    const dateRender = computed(() => fp.value.dateRender)
    const monthCellRender = computed(() => fp.value.monthCellRender)
    const onClick = computed(() => fp.value.onClick)

    // ========================= Refs =========================
    const selectorRef = usePickerRef(expose)

    // ======================= Semantic =======================
    const [mergedClassNames, mergedStyles] = useSemantic(classNames, styles).value

    // ========================= Open =========================
    const [mergedOpen, setMergeOpen] = useOpen(open, defaultOpen, disabled, onOpenChange.value)

    const triggerOpen = (nextOpen: boolean, config?: OpenConfig) => {
      // No need to open if all disabled
      if (disabled.value.some(fieldDisabled => !fieldDisabled) || !nextOpen) {
        setMergeOpen(nextOpen, config)
      }
    }

    // ======================== Values ========================
    const onInternalCalendarChange = (dates: any[], dateStrings: string[], info: BaseInfo) => {
      if (onCalendarChange.value) {
        onCalendarChange.value(dates as any, dateStrings as any, info)
      }
    }

    const onInternalOk = (dates: any[]) => {
      onOk.value?.(dates as any)
    }

    const [mergedValue, setInnerValue, getCalendarValue, triggerCalendarChange, triggerOk]
      = useInnerValue(
        generateConfig,
        locale,
        formatList,
        ref(true), // rangeValue
        ref(false), // order
        defaultValue,
        value,
        onInternalCalendarChange,
        onInternalOk,
      )

    const calendarValue = computed(() => getCalendarValue.value)

    // ======================== Active ========================
    const [
      focused,
      triggerFocus,
      lastOperation,
      activeIndex,
      setActiveIndex,
      nextActiveIndex,
      activeIndexList,
      updateSubmitIndex,
      hasActiveSubmitValue,
    ] = useRangeActive(disabled, allowEmpty, mergedOpen)

    const onSharedFocus = (event: FocusEvent, index?: number) => {
      triggerFocus(true)

      onFocus.value?.(event, {
        range: getActiveRange(index ?? activeIndex.value),
      })
    }

    const onSharedBlur = (event: FocusEvent, index?: number) => {
      triggerFocus(false)

      onBlur.value?.(event, {
        range: getActiveRange(index ?? activeIndex.value),
      })
    }

    // ======================= ShowTime =======================
    /** Used for Popup panel */
    const mergedShowTime = computed<
      PopupShowTimeConfig<any> & Pick<RangeTimeProps<any>, 'defaultOpenValue'>
    >(() => {
      if (!showTime.value) {
        return null as any
      }

      const { disabledTime } = showTime.value as any

      const proxyDisabledTime = disabledTime
        ? (date: any) => {
            const range = getActiveRange(activeIndex.value)
            const fromDate = getFromDate(calendarValue.value, activeIndexList.value, activeIndex.value)
            return disabledTime(date, range, {
              from: fromDate,
            })
          }
        : undefined

      return { ...showTime.value, disabledTime: proxyDisabledTime }
    })

    // ========================= Mode =========================
    const internalModes = ref<[PanelMode, PanelMode]>([picker.value, picker.value] as any)
    const modes = computed(() => (mode.value ? mode.value : internalModes.value) as [PanelMode, PanelMode])
    const setModes = (val: [PanelMode, PanelMode]) => {
      if (mode.value === undefined) {
        internalModes.value = val
      }
    }

    const mergedMode = computed(() => modes.value[activeIndex.value] || picker.value)

    /** Extends from `mergedMode` to patch `datetime` mode */
    const internalMode = computed<InternalMode>(() =>
      mergedMode.value === 'date' && mergedShowTime.value ? 'datetime' : mergedMode.value as any,
    )

    // ====================== PanelCount ======================
    const multiplePanel = computed(() => internalMode.value === picker.value && internalMode.value !== 'time')

    // ======================= Show Now =======================
    const mergedShowNow = useShowNow(picker as any, mergedMode as any, showNow, showToday, ref(true))

    // ======================== Value =========================
    const [
      /** Trigger `onChange` by check `disabledDate` */
      flushSubmit,
      /** Trigger `onChange` directly without check `disabledDate` */
      triggerSubmitChange,
    ] = useRangeValue<RangeValueType<any>, any>(
      fp.value as any,
      mergedValue,
      setInnerValue,
      () => getCalendarValue.value,
      triggerCalendarChange,
      disabled,
      formatList,
      focused,
      mergedOpen,
      isInvalidateDate,
    )

    // ===================== DisabledDate =====================
    const mergedDisabledDate = useRangeDisabledDate(
      calendarValue,
      disabled,
      activeIndexList,
      generateConfig,
      locale,
      disabledDate,
    )

    // ======================= Validate =======================
    const [submitInvalidates, onSelectorInvalid] = useFieldsInvalidate(
      calendarValue,
      isInvalidateDate,
      allowEmpty,
    )

    // ===================== Picker Value =====================
    const [currentPickerValue, setCurrentPickerValue] = useRangePickerValue(
      generateConfig,
      locale,
      calendarValue,
      modes as any,
      mergedOpen,
      activeIndex,
      internalPicker,
      multiplePanel,
      defaultPickerValue,
      pickerValue,
      computed(() => mergedShowTime.value?.defaultOpenValue as any),
      onPickerValueChange,
      minDate,
      maxDate,
    )

    // >>> Mode need wait for `pickerValue`
    const triggerModeChange = (nextPickerValue: any, nextMode: PanelMode, triggerEvent?: boolean) => {
      const clone = fillIndex(modes.value, activeIndex.value, nextMode)

      if (clone[0] !== modes.value[0] || clone[1] !== modes.value[1]) {
        setModes(clone)
      }

      // Compatible with `onPanelChange`
      if (onPanelChange.value && triggerEvent !== false) {
        const clonePickerValue: RangeValueType<any> = [...calendarValue.value]
        if (nextPickerValue) {
          clonePickerValue[activeIndex.value] = nextPickerValue
        }
        onPanelChange.value(clonePickerValue as any, clone)
      }
    }

    // ======================== Change ========================
    const fillCalendarValue = (date: any, index: number) =>
      // Trigger change only when date changed
      fillIndex(calendarValue.value, index, date)

    // ======================== Submit ========================
    /**
     * Trigger by confirm operation.
     * This function has already handle the `needConfirm` check logic.
     * - Selector: enter key
     * - Panel: OK button
     */
    const triggerPartConfirm = (date?: any, skipFocus?: boolean) => {
      let nextValue = calendarValue.value

      if (date) {
        nextValue = fillCalendarValue(date, activeIndex.value)
      }
      updateSubmitIndex(activeIndex.value)
      // Get next focus index
      const nextIndex = nextActiveIndex(nextValue)

      // Change calendar value and tell flush it
      triggerCalendarChange(nextValue)
      flushSubmit(activeIndex.value, nextIndex === null)

      if (nextIndex === null) {
        triggerOpen(false, { force: true })
      }
      else if (!skipFocus) {
        selectorRef.value?.focus({ index: nextIndex })
      }
    }

    // ======================== Click =========================
    const onSelectorClick = (event: MouseEvent) => {
      const rootNode = (event.target as HTMLElement).getRootNode()
      if (
        !selectorRef.value?.nativeElement()?.contains(
          ((rootNode as Document | ShadowRoot).activeElement ?? document.activeElement) as Node,
        )
      ) {
        // Click to focus the enabled input
        const enabledIndex = disabled.value.findIndex(d => !d)
        if (enabledIndex >= 0) {
          selectorRef.value?.focus({ index: enabledIndex })
        }
      }

      triggerOpen(true)

      onClick.value?.(event)
    }

    const onSelectorClear = () => {
      triggerSubmitChange(null as any)
      triggerOpen(false, { force: true })
    }

    // ======================== Hover =========================
    const hoverSource = ref<'cell' | 'preset' | null>(null)
    const internalHoverValues = ref<RangeValueType<any>>(null)

    const hoverValues = computed(() => {
      return internalHoverValues.value || calendarValue.value
    })

    // Clean up `internalHoverValues` when closed
    watch(mergedOpen, () => {
      if (!mergedOpen.value) {
        internalHoverValues.value = null
      }
    })

    // ========================================================
    // ==                       Panels                       ==
    // ========================================================
    // Save the offset with active bar position
    // const [activeOffset, setActiveOffset] = React.useState(0);
    const activeInfo = ref<
      [activeInputLeft: number, activeInputRight: number, selectorWidth: number]
    >([0, 0, 0])

    const onSetHover = (date: RangeValueType<any> | null, source: 'cell' | 'preset') => {
      if (previewValue.value !== 'hover') {
        return
      }
      internalHoverValues.value = date
      hoverSource.value = source
    }

    // ======================= Presets ========================
    const presetList = usePresets(presets, ranges)

    const onPresetHover = (nextValues: RangeValueType<any> | null) => {
      onSetHover(nextValues, 'preset')
    }

    const onPresetSubmit = (nextValues: RangeValueType<any>) => {
      const passed = triggerSubmitChange(nextValues)

      if (passed) {
        triggerOpen(false, { force: true })
      }
    }

    const onNow = (now: any) => {
      triggerPartConfirm(now)
    }

    // ======================== Panel =========================
    const onPanelHover = (date: any) => {
      onSetHover(date ? fillCalendarValue(date, activeIndex.value) : null, 'cell')
    }

    // >>> Focus
    const onPanelFocus = (event: FocusEvent) => {
      triggerOpen(true)
      onSharedFocus(event)
    }

    // >>> MouseDown
    const onPanelMouseDown = () => {
      lastOperation('panel')
    }

    // >>> Calendar
    const onPanelSelect = (date: any) => {
      const clone: RangeValueType<any> = fillIndex(calendarValue.value, activeIndex.value, date)

      // Only trigger calendar event but not update internal `calendarValue` state
      triggerCalendarChange(clone)

      // >>> Trigger next active if !needConfirm
      // Fully logic check `useRangeValue` hook
      if (!needConfirm.value && !complexPicker.value && internalPicker.value === internalMode.value) {
        triggerPartConfirm(date)
      }
    }

    // >>> Close
    const onPopupClose = () => {
      // Close popup
      triggerOpen(false)
    }

    // >>> cellRender
    const onInternalCellRender = useCellRender(
      cellRender,
      dateRender,
      monthCellRender,
      computed(() => getActiveRange(activeIndex.value)),
    )

    // >>> Value
    const panelValue = computed(() => calendarValue.value[activeIndex.value] || null)

    // >>> invalid
    const isPopupInvalidateDate = (date: any) => {
      return isInvalidateDate(date, {
        activeIndex: activeIndex.value,
      })
    }

    const panelProps = computed(() => {
      const domProps = pickAttrs(fp.value, false)
      const restProps = omit(fp.value, [
        ...(Object.keys(domProps) as any[]),
        'onChange',
        'onCalendarChange',
        'style',
        'className',
        'onPanelChange',
        'disabledTime',
        'classNames',
        'styles',
      ])
      return restProps
    })

    // ======================= Context ========================
    const context = computed(() => ({
      prefixCls: prefixCls.value,
      locale: locale.value,
      generateConfig: generateConfig.value,
      button: components.value.button,
      input: components.value.input,
      classNames: mergedClassNames.value,
      styles: mergedStyles.value,
    }))

    providePickerContext(context)

    // ======================== Effect ========================
    // >>> Mode
    // Reset for every active
    watch([mergedOpen, activeIndex, picker], () => {
      if (mergedOpen.value && activeIndex.value !== undefined) {
        // Legacy compatible. This effect update should not trigger `onPanelChange`
        triggerModeChange(null, picker.value as any, false)
      }
    }, { flush: 'post' })

    // >>> For complex picker, we need check if need to focus next one
    watch(mergedOpen, () => {
      const lastOp = lastOperation()

      // Trade as confirm on field leave
      if (!mergedOpen.value && lastOp === 'input') {
        triggerOpen(false)
        triggerPartConfirm(null, true)
      }

      // Submit with complex picker
      if (!mergedOpen.value && complexPicker.value && !needConfirm.value && lastOp === 'panel') {
        triggerOpen(true)
        triggerPartConfirm()
      }
    }, { flush: 'post' })

    // ====================== DevWarning ======================
    if (process.env.NODE_ENV !== 'production') {
      const isIndexEmpty = (index: number) => {
        return (
          // Value is empty
          !value.value?.[index]
          // DefaultValue is empty
          && !defaultValue.value?.[index]
        )
      }

      if (
        disabled.value.some(
          (fieldDisabled, index) => fieldDisabled && isIndexEmpty(index) && !allowEmpty.value[index],
        )
      ) {
        warning(
          false,
          '`disabled` should not set with empty `value`. You should set `allowEmpty` or `value` instead.',
        )
      }
    }

    return () => {
      // >>> Render
      const panel = (
        <Popup
          // MISC
          {...panelProps.value}
          showNow={mergedShowNow.value}
          showTime={mergedShowTime.value}
          // Range
          range
          multiplePanel={multiplePanel.value}
          activeInfo={activeInfo.value}
          // Disabled
          disabledDate={mergedDisabledDate}
          // Focus
          onFocus={onPanelFocus}
          onBlur={onSharedBlur}
          onPanelMouseDown={onPanelMouseDown}
          // Mode
          picker={picker.value as any}
          mode={mergedMode.value}
          internalMode={internalMode.value}
          onPanelChange={triggerModeChange}
          // Value
          format={maskFormat.value}
          value={panelValue.value}
          isInvalid={isPopupInvalidateDate}
          onChange={null as any}
          onSelect={onPanelSelect}
          // PickerValue
          pickerValue={currentPickerValue.value}
          defaultOpenValue={toArray(showTime.value?.defaultOpenValue)[activeIndex.value]}
          onPickerValueChange={setCurrentPickerValue}
          // Hover
          hoverValue={hoverValues.value}
          onHover={onPanelHover}
          // Submit
          needConfirm={needConfirm.value}
          onSubmit={triggerPartConfirm}
          onOk={triggerOk}
          // Preset
          presets={presetList.value}
          onPresetHover={onPresetHover}
          onPresetSubmit={onPresetSubmit}
          // Now
          onNow={onNow}
          // Render
          cellRender={onInternalCellRender}
          // Styles
          classNames={mergedClassNames.value}
          styles={mergedStyles.value}
        />
      )

      return (
        <PickerTrigger
          {...pickTriggerProps(fp.value)}
          popupElement={panel}
          popupStyle={mergedStyles.value.popup?.root}
          popupClassName={clsx(rootClassName.value, mergedClassNames.value.popup?.root)}
          // Visible
          visible={mergedOpen.value}
          onClose={onPopupClose}
          // Range
          range
        >
          <RangeSelector
            // Shared
            {...fp.value}
            // Ref
            // ref={selectorRef} // handled by expose
            // Style
            class={clsx(fp.value.className, rootClassName.value, mergedClassNames.value.root)}
            style={{ ...mergedStyles.value.root, ...fp.value.style }}
            // Icon
            suffixIcon={suffixIcon.value}
            // Active
            activeIndex={focused.value || mergedOpen.value ? activeIndex.value : null}
            activeHelp={!!internalHoverValues.value}
            allHelp={!!internalHoverValues.value && hoverSource.value === 'preset'}
            focused={focused.value}
            onFocus={onSelectorFocus}
            onBlur={onSelectorBlur}
            onKeyDown={onSelectorKeyDown}
            onSubmit={triggerPartConfirm}
            // Change
            value={hoverValues.value}
            maskFormat={maskFormat.value}
            onChange={onSelectorChange}
            onInputChange={onSelectorInputChange}
            // Format
            format={formatList.value}
            inputReadOnly={inputReadOnly.value}
            // Disabled
            disabled={disabled.value}
            // Open
            open={mergedOpen.value}
            onOpenChange={triggerOpen}
            // Click
            onClick={onSelectorClick}
            onClear={onSelectorClear}
            // Invalid
            invalid={submitInvalidates.value}
            onInvalid={onSelectorInvalid}
            // Offset
            onActiveInfo={(info) => {
              activeInfo.value = info
            }}
          />
        </PickerTrigger>
      )
    }
  },
})
