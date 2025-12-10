import type { MouseEventHandler } from '@v-c/util/dist/EventInterface'
import type { InputHTMLAttributes, PropType } from 'vue'
import type { RangeTimeProps, SharedPickerProps, SharedTimeProps, ValueDate } from '../../interface'
import type { FooterProps } from './Footer'
import type { PopupPanelProps } from './PopupPanel'
import { computed, defineComponent } from 'vue'
import { usePickerContext } from '../context'

export type PopupShowTimeConfig<DateType extends object = any> = Omit<
  RangeTimeProps<DateType>,
  'defaultValue' | 'defaultOpenValue' | 'disabledTime'
>
& Pick<SharedTimeProps<DateType>, 'disabledTime'>

export interface PopupProps<DateType extends object = any, PresetValue = DateType>
  extends Pick<InputHTMLAttributes, 'onFocus' | 'onBlur'>,
  FooterProps<DateType>,
  PopupPanelProps<DateType> {
  panelRender?: SharedPickerProps['panelRender']

  // Presets
  presets: ValueDate<DateType>[]
  onPresetHover: (presetValue: PresetValue) => void
  onPresetSubmit: (presetValue: PresetValue) => void

  // Range
  activeInfo?: [activeInputLeft: number, activeInputRight: number, selectorWidth: number]
  // Direction
  direction?: 'ltr' | 'rtl'

  // Fill
  /** TimePicker or showTime only */
  defaultOpenValue: DateType

  // Change
  needConfirm: boolean
  isInvalid: (date: DateType | DateType[]) => boolean
  onOk: VoidFunction

  onPanelMouseDown?: MouseEventHandler

  classNames?: SharedPickerProps['classNames']
  styles?: SharedPickerProps['styles']
}

export default defineComponent(<DateType extends object = any>(props: PopupProps<DateType>) => {
  const ctx = usePickerContext()
  const panelPrefixCls = computed(() => `${ctx.value.prefixCls}-panel`)

  return () => {
    //
  }
}, {
  name: 'Popup',
  inheritAttrs: false,
  props: {
    // Input focus/blur
    onFocus: { type: Function as PropType<PopupProps['onFocus']> },
    onBlur: { type: Function as PropType<PopupProps['onBlur']> },

    // Footer props
    mode: { type: String as PropType<PopupProps['mode']>, required: true },
    internalMode: { type: String as PropType<PopupProps['internalMode']>, required: true },
    renderExtraFooter: { type: Function as PropType<PopupProps['renderExtraFooter']> },
    showNow: { type: Boolean as PropType<PopupProps['showNow']>, required: true },
    generateConfig: { type: Object as PropType<PopupProps['generateConfig']>, required: true },
    disabledDate: { type: Function as PropType<PopupProps['disabledDate']>, required: true },
    showTime: { type: Object as PropType<PopupProps['showTime']> },
    invalid: { type: Boolean as PropType<PopupProps['invalid']> },
    onSubmit: { type: Function as PropType<PopupProps['onSubmit']>, required: true },
    onNow: { type: Function as PropType<PopupProps['onNow']>, required: true },
    locale: { type: Object as PropType<PopupProps['locale']>, required: true },

    // Panel props (from PopupPanelProps)
    onPanelChange: { type: Function as PropType<PopupProps['onPanelChange']>, required: true },
    picker: { type: String as PropType<PopupProps['picker']> },
    defaultPickerValue: { type: Object as PropType<PopupProps['defaultPickerValue']> },
    pickerValue: { type: Object as PropType<PopupProps['pickerValue']> },
    onSelect: { type: Function as PropType<PopupProps['onSelect']> },
    onChange: { type: Function as PropType<PopupProps['onChange']> },
    cellRender: { type: Function as PropType<PopupProps['cellRender']> },
    dateRender: { type: Function as PropType<PopupProps['dateRender']> },
    monthCellRender: { type: Function as PropType<PopupProps['monthCellRender']> },
    hoverValue: { type: Array as PropType<PopupProps['hoverValue']> },
    hoverRangeValue: { type: Array as PropType<any> },
    onHover: { type: Function as PropType<PopupProps['onHover']> },
    showWeek: { type: Boolean as PropType<PopupProps['showWeek']> },
    components: { type: Object as PropType<PopupProps['components']> },
    prevIcon: { type: [Object, String] as PropType<PopupProps['prevIcon']> },
    nextIcon: { type: [Object, String] as PropType<PopupProps['nextIcon']> },
    superPrevIcon: { type: [Object, String] as PropType<PopupProps['superPrevIcon']> },
    superNextIcon: { type: [Object, String] as PropType<PopupProps['superNextIcon']> },
    minDate: { type: Object as PropType<PopupProps['minDate']> },
    maxDate: { type: Object as PropType<PopupProps['maxDate']> },
    format: { type: String as PropType<PopupProps['format']> },
    showHour: { type: Boolean as PropType<PopupProps['showHour']> },
    showMinute: { type: Boolean as PropType<PopupProps['showMinute']> },
    showSecond: { type: Boolean as PropType<PopupProps['showSecond']> },
    showMillisecond: { type: Boolean as PropType<PopupProps['showMillisecond']> },
    use12Hours: { type: Boolean as PropType<PopupProps['use12Hours']> },
    hourStep: { type: Number as PropType<PopupProps['hourStep']> },
    minuteStep: { type: Number as PropType<PopupProps['minuteStep']> },
    secondStep: { type: Number as PropType<PopupProps['secondStep']> },
    millisecondStep: { type: Number as PropType<PopupProps['millisecondStep']> },
    hideDisabledOptions: { type: Boolean as PropType<PopupProps['hideDisabledOptions']> },
    defaultValue: { type: Object as PropType<PopupProps['defaultValue']> },
    disabledHours: { type: Function as PropType<PopupProps['disabledHours']> },
    disabledMinutes: { type: Function as PropType<PopupProps['disabledMinutes']> },
    disabledSeconds: { type: Function as PropType<PopupProps['disabledSeconds']> },
    disabledTime: { type: Function as PropType<PopupProps['disabledTime']> },
    changeOnScroll: { type: Boolean as PropType<PopupProps['changeOnScroll']> },
    tabindex: { type: Number as PropType<PopupProps['tabindex']> },
    multiplePanel: { type: Boolean as PropType<PopupProps['multiplePanel']> },
    range: { type: Boolean as PropType<PopupProps['range']> },
    onPickerValueChange: { type: Function as PropType<PopupProps['onPickerValueChange']>, required: true },

    // Popup-specific
    panelRender: { type: Function as PropType<PopupProps['panelRender']> },
    presets: { type: Array as PropType<PopupProps['presets']>, required: true },
    onPresetHover: { type: Function as PropType<PopupProps['onPresetHover']>, required: true },
    onPresetSubmit: { type: Function as PropType<PopupProps['onPresetSubmit']>, required: true },
    activeInfo: { type: Array as PropType<any> },
    direction: { type: String as PropType<PopupProps['direction']> },
    defaultOpenValue: { type: Object as PropType<PopupProps['defaultOpenValue']>, required: true },
    needConfirm: { type: Boolean as PropType<PopupProps['needConfirm']>, required: true },
    isInvalid: { type: Function as PropType<PopupProps['isInvalid']>, required: true },
    onOk: { type: Function as PropType<PopupProps['onOk']>, required: true },
    onPanelMouseDown: { type: Function as PropType<PopupProps['onPanelMouseDown']> },
    classNames: { type: Object as PropType<PopupProps['classNames']> },
    styles: { type: Object as PropType<PopupProps['styles']> },
  },
})
