import type { PropType } from 'vue'
import type { BaseInfo, InternalMode, PanelMode, PickerRef, SelectorProps, SharedPickerProps, SharedTimeProps, ValueDate } from '../interface'
import { clsx } from '@v-c/util'
import omit from '@v-c/util/dist/omit'
import pickAttrs from '@v-c/util/dist/pickAttrs'
import { computed, defineComponent, provide, ref, toRefs, watch, watchEffect } from 'vue'
import { useSemantic } from '../hooks/useSemantic'
import useToggleDates from '../hooks/useToggleDates'
import { providePickerContext } from './context'
import useCellRender from './hooks/useCellRender'
import useFieldsInvalidate from './hooks/useFieldsInvalidate'
import useFilledProps from './hooks/useFilledProps'
import useOpen from './hooks/useOpen'
import usePickerRef from './hooks/usePickerRef'
import usePresets from './hooks/usePresets'
import useRangeActive from './hooks/useRangeActive'
import useRangePickerValue from './hooks/useRangePickerValue'
import useRangeValue, { useInnerValue } from './hooks/useRangeValue'
import useShowNow from './hooks/useShowNow'
import PickerTrigger from '../PickerTrigger'
import { pickTriggerProps } from '../PickerTrigger/util'
import { toArray } from '../utils/miscUtil'
import Popup from './Popup'
import SingleSelector from './Selector/SingleSelector'

// TODO: isInvalidateDate with showTime.disabledTime should not provide `range` prop

export interface BasePickerProps<DateType extends object = any>
  extends SharedPickerProps<DateType> {
  // Structure
  id?: string

  /** Not support `time` or `datetime` picker */
  multiple?: boolean
  removeIcon?: any
  /** Only work when `multiple` is in used */
  maxTagCount?: number | 'responsive'

  // Value
  value?: DateType | DateType[] | null
  defaultValue?: DateType | DateType[]
  onChange?: (date: DateType | DateType[], dateString: string | string[]) => void
  onCalendarChange?: (
    date: DateType | DateType[],
    dateString: string | string[],
    info: BaseInfo,
  ) => void
  /**  */
  onOk?: (value?: DateType | DateType[]) => void

  // Placeholder
  placeholder?: string

  // Picker Value
  /**
   * Config the popup panel date.
   * Every time active the input to open popup will reset with `defaultPickerValue`.
   *
   * Note: `defaultPickerValue` priority is higher than `value` for the first open.
   */
  defaultPickerValue?: DateType | null
  /**
   * Config each start & end field popup panel date.
   * When config `pickerValue`, you must also provide `onPickerValueChange` to handle changes.
   */
  pickerValue?: DateType | null
  /**
   * Each popup panel `pickerValue` change will trigger the callback.
   * @param date The changed picker value
   * @param info.source `panel` from the panel click. `reset` from popup open or field typing.
   */
  onPickerValueChange?: (
    date: DateType,
    info: {
      source: 'reset' | 'panel'
      mode: PanelMode
    },
  ) => void

  // Preset
  presets?: ValueDate<DateType>[]

  // Control
  disabled?: boolean

  // Mode
  mode?: PanelMode
  onPanelChange?: (values: DateType, modes: PanelMode) => void
}

export interface PickerProps<DateType extends object = any>
  extends BasePickerProps<DateType>,
  Omit<SharedTimeProps<DateType>, 'format' | 'defaultValue'> {}

export default defineComponent({
  name: 'SinglePicker',
  inheritAttrs: false,
  props: {
    // ... all props from PickerProps
    // Need to list them explicitly for Vue props
    prefixCls: String,
    id: String,
    popupElement: Object,
    popupStyle: Object,
    transitionName: String,
    getPopupContainer: Function,
    popupAlign: Object,
    range: Boolean,
    popupClassName: String,
    placement: String,
    builtinPlacements: Object,
    direction: String,
    visible: Boolean,
    onClose: Function,

    // SharedPickerProps
    locale: Object,
    generateConfig: Object,
    picker: String,
    value: [Object, Array],
    defaultValue: [Object, Array],
    onChange: Function,
    onCalendarChange: Function,
    onOk: Function,
    placeholder: String,
    defaultPickerValue: Object,
    pickerValue: Object,
    onPickerValueChange: Function,
    presets: Array,
    disabled: Boolean,
    mode: String,
    onPanelChange: Function,
    format: [String, Array, Function],
    inputReadOnly: Boolean,
    suffixIcon: Object,
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
    showTime: [Boolean, Object],
    showNow: Boolean,
    showToday: Boolean,
    defaultOpen: Boolean,
    open: { type: Boolean, default: undefined },
    onOpenChange: Function,
    className: String,
    style: Object,
    styles: Object,
    classNames: Object,
    previewValue: String,
    order: Boolean,
    needConfirm: Boolean,
    allowClear: [Boolean, Object],
    clearIcon: Object,
    multiple: Boolean,
    maxTagCount: [Number, String],
    disabledDate: Function,
    minDate: Object,
    maxDate: Object,
    defaultOpenValue: Object,
    inputRender: Function,
  },
  setup(props, { expose, attrs }) {
    // ========================= Prop =========================
    const [filledProps, internalPicker, complexPicker, formatList, maskFormat, isInvalidateDate]
      = useFilledProps(props as any)

    // Destructure filledProps using toRefs to keep reactivity?
    // filledProps is a ComputedRef. We can access .value.
    // But we need individual refs for hooks.
    // We can create computed refs for each property.

    const fp = computed(() => filledProps.value)

    const prefixCls = computed(() => fp.value.prefixCls)
    const rootClassName = computed(() => fp.value.rootClassName)
    const styles = computed(() => fp.value.styles)
    const classNames = computed(() => fp.value.classNames)
    const previewValue = computed(() => fp.value.previewValue)
    const order = computed(() => fp.value.order)
    const defaultValue = computed(() => fp.value.defaultValue)
    const value = computed(() => fp.value.value)
    const needConfirm = computed(() => fp.value.needConfirm)
    const onChange = computed(() => fp.value.onChange)
    const onKeyDown = computed(() => fp.value.onKeyDown)
    const disabled = computed(() => fp.value.disabled)
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
    const multiple = computed(() => fp.value.multiple)
    const defaultPickerValue = computed(() => fp.value.defaultPickerValue)
    const pickerValue = computed(() => fp.value.pickerValue)
    const onPickerValueChange = computed(() => fp.value.onPickerValueChange)
    const inputReadOnly = computed(() => fp.value.inputReadOnly)
    const suffixIcon = computed(() => fp.value.suffixIcon)
    const removeIcon = computed(() => fp.value.removeIcon)
    const onFocus = computed(() => fp.value.onFocus)
    const onBlur = computed(() => fp.value.onBlur)
    const presets = computed(() => fp.value.presets)
    const components = computed(() => fp.value.components)
    const cellRender = computed(() => fp.value.cellRender)
    const dateRender = computed(() => fp.value.dateRender)
    const monthCellRender = computed(() => fp.value.monthCellRender)
    const onClick = computed(() => fp.value.onClick)

    // ========================= Refs =========================
    const selectorRef = usePickerRef(expose)

    // ========================= Util =========================
    function pickerParam<T>(values: T | T[]) {
      if (values === null) {
        return null
      }

      return multiple.value ? values : values[0]
    }

    const toggleDates = useToggleDates(generateConfig, locale, internalPicker)

    // ======================= Semantic =======================
    const [mergedClassNames, mergedStyles] = useSemantic(classNames, styles)

    // ========================= Open =========================
    const [mergedOpen, triggerOpen] = useOpen(open, defaultOpen, computed(() => [disabled.value]), onOpenChange.value)

    // ======================= Calendar =======================
    const onInternalCalendarChange = (dates: any[], dateStrings: string[], info: BaseInfo) => {
      if (onCalendarChange.value) {
        const filteredInfo = {
          ...info,
        }
        delete filteredInfo.range
        onCalendarChange.value(pickerParam(dates), pickerParam(dateStrings), filteredInfo)
      }
    }

    const onInternalOk = (dates: any[]) => {
      onOk.value?.(pickerParam(dates))
    }

    // ======================== Values ========================
    const [mergedValue, setInnerValue, getCalendarValue, triggerCalendarChange, triggerOk]
      = useInnerValue(
        generateConfig,
        locale,
        formatList,
        ref(false), // rangeValue
        order,
        defaultValue,
        value,
        onInternalCalendarChange,
        onInternalOk,
      )

    const calendarValue = computed(() => getCalendarValue.value)

    // ======================== Active ========================
    // In SinglePicker, we will always get `activeIndex` is 0.
    const [focused, triggerFocus, lastOperation, activeIndex] = useRangeActive(computed(() => [disabled.value]))

    const onSharedFocus = (event: FocusEvent) => {
      triggerFocus(true)
      onFocus.value?.(event)
    }

    const onSharedBlur = (event: FocusEvent) => {
      triggerFocus(false)
      onBlur.value?.(event)
    }

    // ========================= Mode =========================
    const internalModeState = ref(picker.value)
    const mergedMode = computed(() => mode.value || internalModeState.value)
    const setMode = (val: PanelMode) => {
      if (mode.value === undefined) {
        internalModeState.value = val
      }
    }

    /** Extends from `mergedMode` to patch `datetime` mode */
    const internalMode = computed(() => mergedMode.value === 'date' && showTime.value ? 'datetime' : mergedMode.value)

    // ======================= Show Now =======================
    const mergedShowNow = useShowNow(picker as any, mergedMode, showNow, showToday)

    // ======================== Value =========================
    const onInternalChange = (dates: any[], dateStrings: string[]) => {
      if (onChange.value) {
        onChange.value(pickerParam(dates), pickerParam(dateStrings))
      }
    }

    const [
      ,
      /** Trigger `onChange` directly without check `disabledDate` */
      triggerSubmitChange,
    ] = useRangeValue(
      {
        ...fp.value,
        onChange: onInternalChange,
      } as any, // FIXME: type
      mergedValue,
      setInnerValue,
      () => getCalendarValue.value,
      triggerCalendarChange,
      computed(() => []), // disabled
      formatList,
      focused,
      mergedOpen,
      isInvalidateDate,
    )

    // ======================= Validate =======================
    const [submitInvalidates, onSelectorInvalid] = useFieldsInvalidate(
      calendarValue,
      isInvalidateDate,
    )

    const submitInvalidate = computed(() => submitInvalidates.value.some(invalidated => invalidated))

    // ===================== Picker Value =====================
    // Proxy to single pickerValue
    const onInternalPickerValueChange = (
      dates: any[],
      info: BaseInfo & { source: 'reset' | 'panel', mode: [PanelMode, PanelMode] },
    ) => {
      if (onPickerValueChange.value) {
        const cleanInfo = { ...info, mode: info.mode[0] }
        delete cleanInfo.range
        onPickerValueChange.value(dates[0], cleanInfo)
      }
    }

    const [currentPickerValue, setCurrentPickerValue] = useRangePickerValue(
      generateConfig,
      locale,
      calendarValue,
      computed(() => [mergedMode.value]),
      mergedOpen,
      activeIndex,
      internalPicker,
      ref(false), // multiplePanel,
      defaultPickerValue,
      pickerValue,
      computed(() => toArray(showTime.value?.defaultOpenValue)),
      onInternalPickerValueChange,
      minDate,
      maxDate,
    )

    // >>> Mode need wait for `pickerValue`
    // useEvent in React
    const triggerModeChange = (nextPickerValue: any, nextMode: PanelMode, triggerEvent?: boolean) => {
      setMode(nextMode)

      // Compatible with `onPanelChange`
      if (onPanelChange.value && triggerEvent !== false) {
        const lastPickerValue = nextPickerValue || calendarValue.value[calendarValue.value.length - 1]
        onPanelChange.value(lastPickerValue, nextMode)
      }
    }

    // ======================== Submit ========================
    /**
     * Different with RangePicker, confirm should check `multiple` logic.
     * This will never provide `date` instead.
     */
    const triggerConfirm = () => {
      triggerSubmitChange(getCalendarValue.value)

      triggerOpen(false, { force: true })
    }

    // ======================== Click =========================
    const onSelectorClick = (event: MouseEvent) => {
      if (!disabled.value && !selectorRef.value?.nativeElement?.contains(document.activeElement)) {
        // Click to focus the enabled input
        selectorRef.value?.focus()
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
    const internalHoverValue = ref<any>(null)

    const hoverValues = computed(() => {
      const values = [internalHoverValue.value, ...calendarValue.value].filter(date => date)
      return multiple.value ? values : values.slice(0, 1)
    })

    // Selector values is different with RangePicker
    // which can not use `hoverValue` directly
    const selectorValues = computed(() => {
      if (!multiple.value && internalHoverValue.value) {
        return [internalHoverValue.value]
      }
      return calendarValue.value.filter(date => date)
    })

    // Clean up `internalHoverValues` when closed
    watch(mergedOpen, () => {
      if (!mergedOpen.value) {
        internalHoverValue.value = null
      }
    })

    const onSetHover = (date: any | null, source: 'cell' | 'preset') => {
      if (previewValue.value !== 'hover') {
        return
      }
      internalHoverValue.value = date
      hoverSource.value = source
    }

    // ========================================================
    // ==                       Panels                       ==
    // ========================================================
    // ======================= Presets ========================
    const presetList = usePresets(presets)

    const onPresetHover = (nextValue: any | null) => {
      onSetHover(nextValue, 'preset')
    }

    // TODO: handle this
    const onPresetSubmit = (nextValue: any) => {
      const nextCalendarValues = multiple.value ? toggleDates(getCalendarValue.value, nextValue) : [nextValue]
      const passed = triggerSubmitChange(nextCalendarValues)

      if (passed && !multiple.value) {
        triggerOpen(false, { force: true })
      }
    }

    const onNow = (now: any) => {
      onPresetSubmit(now)
    }

    // ======================== Panel =========================
    const onPanelHover = (date: any | null) => {
      onSetHover(date, 'cell')
    }

    // >>> Focus
    const onPanelFocus = (event: FocusEvent) => {
      triggerOpen(true)
      onSharedFocus(event)
    }

    // >>> Calendar
    const onPanelSelect = (date: any) => {
      lastOperation('panel')

      // Not change values if multiple and current panel is to match with picker
      if (multiple.value && internalMode.value !== picker.value) {
        return
      }

      const nextValues = multiple.value ? toggleDates(getCalendarValue.value, date) : [date]

      // Only trigger calendar event but not update internal `calendarValue` state
      triggerCalendarChange(nextValues)

      // >>> Trigger next active if !needConfirm
      // Fully logic check `useRangeValue` hook
      if (!needConfirm.value && !complexPicker.value && internalPicker.value === internalMode.value) {
        triggerConfirm()
      }
    }

    // >>> Close
    const onPopupClose = () => {
      // Close popup
      triggerOpen(false)
    }

    // >>> cellRender
    const onInternalCellRender = useCellRender(cellRender, dateRender, monthCellRender)

    // >>> invalid

    const panelProps = computed(() => {
      const domProps = pickAttrs(fp.value, false)
      const restProps = omit(fp.value, [
        ...(Object.keys(domProps) as any[]),
        'onChange',
        'onCalendarChange',
        'style',
        'className',
        'onPanelChange',
        'classNames',
        'styles',
      ])
      return {
        ...restProps,
        multiple: fp.value.multiple,
      }
    })

    // ========================================================
    // ==                      Selector                      ==
    // ========================================================

    // ======================== Change ========================
    const onSelectorChange = (date: any[]) => {
      triggerCalendarChange(date)
    }

    const onSelectorInputChange = () => {
      lastOperation('input')
    }

    // ======================= Selector =======================
    const onSelectorFocus: SelectorProps['onFocus'] = (event) => {
      lastOperation('input')

      triggerOpen(true, {
        inherit: true,
      })

      // setActiveIndex(index);

      onSharedFocus(event)
    }

    const onSelectorBlur: SelectorProps['onBlur'] = (event) => {
      triggerOpen(false)

      onSharedBlur(event)
    }

    const onSelectorKeyDown: SelectorProps['onKeyDown'] = (event) => {
      if (event.key === 'Tab') {
        triggerConfirm()
      }

      onKeyDown.value?.(event)
    }

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
        triggerConfirm()
      }

      // Submit with complex picker
      if (!mergedOpen.value && complexPicker.value && !needConfirm.value && lastOp === 'panel') {
        triggerConfirm()
      }
    }, { flush: 'post' })

    return () => {
      // >>> Render
      const panel = (
        <Popup
          // MISC
          {...panelProps.value}
          showNow={mergedShowNow.value}
          showTime={showTime.value}
          // Disabled
          disabledDate={disabledDate.value}
          // Focus
          onFocus={onPanelFocus}
          onBlur={onSharedBlur}
          // Mode
          picker={picker.value as any}
          mode={mergedMode.value}
          internalMode={internalMode.value}
          onPanelChange={triggerModeChange}
          // Value
          format={maskFormat.value}
          value={calendarValue.value}
          isInvalid={isInvalidateDate}
          onChange={null as any}
          onSelect={onPanelSelect}
          // PickerValue
          pickerValue={currentPickerValue.value}
          defaultOpenValue={showTime.value?.defaultOpenValue}
          onPickerValueChange={setCurrentPickerValue}
          // Hover
          hoverValue={hoverValues.value}
          onHover={onPanelHover}
          // Submit
          needConfirm={needConfirm.value}
          onSubmit={triggerConfirm}
          onOk={triggerOk}
          // Preset
          presets={presetList.value}
          onPresetHover={onPresetHover}
          onPresetSubmit={onPresetSubmit}
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
        >
          <SingleSelector
            // Shared
            {...fp.value}
            // Ref
            // ref={selectorRef} // Selector ref is handled via expose in usePickerRef
            // Style
            class={clsx(fp.value.className, rootClassName.value, mergedClassNames.value.root)}
            style={{ ...mergedStyles.value.root, ...fp.value.style }}
            // Icon
            suffixIcon={suffixIcon.value}
            removeIcon={removeIcon.value}
            // Active
            activeHelp={!!internalHoverValue.value}
            allHelp={!!internalHoverValue.value && hoverSource.value === 'preset'}
            focused={focused.value}
            onFocus={onSelectorFocus}
            onBlur={onSelectorBlur}
            onKeyDown={onSelectorKeyDown}
            onSubmit={triggerConfirm}
            // Change
            value={selectorValues.value}
            maskFormat={maskFormat.value}
            onChange={onSelectorChange}
            onInputChange={onSelectorInputChange}
            // internalPicker={internalPicker.value} // Not in props of SingleSelector? Check SingleSelector.tsx
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
            invalid={submitInvalidate.value}
            onInvalid={(invalid) => {
              // Only `single` mode support type date.
              // `multiple` mode can not typing.
              onSelectorInvalid(invalid, 0)
            }}
          />
        </PickerTrigger>
      )
    }
  },
})
