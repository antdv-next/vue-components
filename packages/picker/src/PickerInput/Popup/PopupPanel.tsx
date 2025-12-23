import type { PropType } from 'vue'
import type { PanelMode } from '../../interface'
import type { PickerPanelProps } from '../../PickerPanel'
import type { PickerHackContextProps } from '../../PickerPanel/context'
import type { FooterProps } from './Footer'
import { computed, defineComponent, toRef, toRefs } from 'vue'
import PickerPanel from '../../PickerPanel'
import { providePickerHackContext } from '../../PickerPanel/context'
import { usePickerContext } from '../context'
import { offsetPanelDate } from '../hooks/useRangePickerValue'

export type MustProp<DateType extends object> = Required<
  Pick<PickerPanelProps<DateType>, 'mode' | 'onPanelChange'>
>

type PopupPanelPropsWrapper<DateType extends object = any>
  = MustProp<DateType>
    & Omit<PickerPanelProps<DateType>, 'onPickerValueChange' | 'showTime'>
    & FooterProps<DateType>

export interface PopupPanelProps<DateType extends object = any>
  extends /* @vue-ignore */ PopupPanelPropsWrapper<DateType> {
  multiplePanel?: boolean
  range?: boolean
  onPickerValueChange: (date: DateType) => void
}

// provider components
const PickerPanelProvider = defineComponent({
  name: 'PickerPanelProvider',
  props: {
    value: {
      type: Object as PropType<PickerHackContextProps>,
      required: true,
    },
  },
  setup(props, { slots }) {
    providePickerHackContext(toRef(props, 'value'))
    return () => {
      return (
        slots.default?.() || null
      )
    }
  },
})

export default defineComponent(<DateType extends object = any>(props: PopupPanelProps<DateType>) => {
  const ctx = usePickerContext()

  const {
    picker,
    pickerValue,
    needConfirm,
    onSubmit,
    range,
    hoverValue,
    multiplePanel,
    onPickerValueChange,
  } = toRefs(props)

  // ======================== Offset ========================
  const internalOffsetDate = (date: DateType, offset: number) => {
    const { generateConfig } = ctx.value || {}
    return offsetPanelDate(generateConfig, picker?.value as PanelMode, date, offset)
  }

  const nextPickerValue = computed(() => {
    return internalOffsetDate(pickerValue?.value as DateType, 1)
  })

  // Outside
  const onSecondPickerValueChange = (nextDate: DateType) => {
    onPickerValueChange.value(internalOffsetDate(nextDate, -1))
  }
  // ======================= Context ========================
  const sharedContext: PickerHackContextProps = {
    onCellDblClick: () => {
      if (needConfirm.value) {
        onSubmit.value()
      }
    },
  }

  const hideHeader = computed(() => picker?.value === 'time')

  // ======================== Props =========================
  const pickerProps = computed(() => {
    const baseProps = {
      ...props,
      hoverValue: null as DateType[] | undefined | null,
      hoverRangeValue: null as DateType[] | undefined | null,
      hideHeader: hideHeader.value,
    }

    if (range?.value) {
      baseProps.hoverRangeValue = hoverValue?.value as any
    }
    else {
      baseProps.hoverValue = hoverValue?.value as any
    }

    return baseProps
  })

  return () => {
    // ======================== Render ========================
    const { prefixCls } = ctx.value
    // Multiple
    if (multiplePanel?.value) {
      return (
        <div class={`${prefixCls}-panels`}>
          <PickerPanelProvider
            value={{
              ...sharedContext,
              hideNext: true,
            }}
          >
            <PickerPanel {...pickerProps.value as any} />
          </PickerPanelProvider>
          <PickerPanelProvider
            value={{
              ...sharedContext,
              hidePrev: true,
            }}
          >
            <PickerPanel
              {...pickerProps.value as any}
              pickerValue={nextPickerValue.value as any}
              onPickerValueChange={onSecondPickerValueChange}
            />
          </PickerPanelProvider>
        </div>
      )
    }

    // Single
    return (
      <PickerPanelProvider
        value={{
          ...sharedContext,
        }}
      >
        <PickerPanel {...pickerProps.value as any} />
      </PickerPanelProvider>
    )
  }
}, {
  name: 'PopupPanel',
  inheritAttrs: false,
  props: {
    // Panel control
    mode: { type: String as PropType<PopupPanelProps['mode']>, required: true },
    onPanelChange: { type: Function as PropType<PopupPanelProps['onPanelChange']>, required: true },

    picker: { type: String as PropType<PopupPanelProps['picker']> },
    direction: { type: String as PropType<PopupPanelProps['direction']> },
    defaultPickerValue: { type: Object as PropType<PopupPanelProps['defaultPickerValue']> },
    pickerValue: { type: Object as PropType<PopupPanelProps['pickerValue']> },

    // Value change
    onSelect: { type: Function as PropType<PopupPanelProps['onSelect']> },
    onChange: { type: Function as PropType<PopupPanelProps['onChange']> },

    // Render
    cellRender: { type: Function as PropType<PopupPanelProps['cellRender']> },
    dateRender: { type: Function as PropType<PopupPanelProps['dateRender']> },
    monthCellRender: { type: Function as PropType<PopupPanelProps['monthCellRender']> },

    // Hover
    hoverValue: { type: Array as PropType<PopupPanelProps['hoverValue']> },
    hoverRangeValue: { type: Array as PropType<any> },
    onHover: { type: Function as PropType<PopupPanelProps['onHover']> },

    // Week
    showWeek: { type: Boolean as PropType<PopupPanelProps['showWeek']> },

    // Components & icons
    components: { type: Object as PropType<PopupPanelProps['components']> },
    prevIcon: { type: [Object, String] as PropType<PopupPanelProps['prevIcon']> },
    nextIcon: { type: [Object, String] as PropType<PopupPanelProps['nextIcon']> },
    superPrevIcon: { type: [Object, String] as PropType<PopupPanelProps['superPrevIcon']> },
    superNextIcon: { type: [Object, String] as PropType<PopupPanelProps['superNextIcon']> },

    // Limitation
    disabledDate: { type: Function as PropType<PopupPanelProps['disabledDate']>, required: true },
    minDate: { type: Object as PropType<PopupPanelProps['minDate']> },
    maxDate: { type: Object as PropType<PopupPanelProps['maxDate']> },

    // Time related (from SharedTimeProps)
    format: { type: String as PropType<PopupPanelProps['format']> },
    showHour: { type: Boolean as PropType<PopupPanelProps['showHour']> },
    showMinute: { type: Boolean as PropType<PopupPanelProps['showMinute']> },
    showSecond: { type: Boolean as PropType<PopupPanelProps['showSecond']> },
    showMillisecond: { type: Boolean as PropType<PopupPanelProps['showMillisecond']> },
    use12Hours: { type: Boolean as PropType<PopupPanelProps['use12Hours']> },
    hourStep: { type: Number as PropType<PopupPanelProps['hourStep']> },
    minuteStep: { type: Number as PropType<PopupPanelProps['minuteStep']> },
    secondStep: { type: Number as PropType<PopupPanelProps['secondStep']> },
    millisecondStep: { type: Number as PropType<PopupPanelProps['millisecondStep']> },
    hideDisabledOptions: { type: Boolean as PropType<PopupPanelProps['hideDisabledOptions']> },
    defaultValue: { type: Object as PropType<PopupPanelProps['defaultValue']> },
    defaultOpenValue: { type: Object as PropType<PopupPanelProps['defaultOpenValue']> },
    disabledHours: { type: Function as PropType<PopupPanelProps['disabledHours']> },
    disabledMinutes: { type: Function as PropType<PopupPanelProps['disabledMinutes']> },
    disabledSeconds: { type: Function as PropType<PopupPanelProps['disabledSeconds']> },
    disabledTime: { type: Function as PropType<PopupPanelProps['disabledTime']> },
    changeOnScroll: { type: Boolean as PropType<PopupPanelProps['changeOnScroll']> },

    // Attrs
    tabindex: { type: Number as PropType<PopupPanelProps['tabindex']> },

    // Footer props
    internalMode: { type: String as PropType<PopupPanelProps['internalMode']>, required: true },
    renderExtraFooter: { type: Function as PropType<PopupPanelProps['renderExtraFooter']> },
    showNow: { type: Boolean as PropType<PopupPanelProps['showNow']>, required: true },
    needConfirm: { type: Boolean as PropType<PopupPanelProps['needConfirm']>, required: true },
    invalid: { type: Boolean as PropType<PopupPanelProps['invalid']> },
    onSubmit: { type: Function as PropType<PopupPanelProps['onSubmit']>, required: true },
    onNow: { type: Function as PropType<PopupPanelProps['onNow']>, required: true },
    showTime: { type: Object as PropType<PopupPanelProps['showTime']> },

    // Context
    locale: { type: Object as PropType<PopupPanelProps['locale']>, required: true },
    generateConfig: { type: Object as PropType<PopupPanelProps['generateConfig']>, required: true },

    // Multiple panel control
    multiplePanel: { type: Boolean as PropType<PopupPanelProps['multiplePanel']> },
    range: { type: Boolean as PropType<PopupPanelProps['range']> },

    // Picker value change (handled by PopupPanel)
    onPickerValueChange: { type: Function as PropType<PopupPanelProps['onPickerValueChange']>, required: true },

    // Styling pass-through
    styles: { type: Object as PropType<PopupPanelProps['styles']> },
    classNames: { type: Object as PropType<PopupPanelProps['classNames']> },

    // Internal
    hideHeader: { type: Boolean as PropType<PopupPanelProps['hideHeader']> },
  },
})
