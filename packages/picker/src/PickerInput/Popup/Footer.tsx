import type { PopupShowTimeConfig } from '.'
import type { GenerateConfig } from '../../generate'
import type {
  DisabledDate,
  InternalMode,
  PanelMode,
  SharedPickerProps,
} from '../../interface'
import { clsx } from '@v-c/util'
import { computed, defineComponent, toRefs } from 'vue'
import useTimeInfo from '../../hooks/useTimeInfo'
import { usePickerContext } from '../context'

export interface FooterProps<DateType extends object = any> {
  mode: PanelMode
  internalMode: InternalMode
  renderExtraFooter?: SharedPickerProps['renderExtraFooter']
  showNow: boolean
  generateConfig: GenerateConfig<DateType>
  disabledDate: DisabledDate<DateType>
  showTime?: PopupShowTimeConfig<DateType>

  // Invalid
  /** From Footer component used only. Check if can OK button click */
  invalid?: boolean

  // Submit
  onSubmit: (date?: DateType) => void
  needConfirm: boolean

  // Now
  onNow: (now: DateType) => void
}

export interface FooterProps<DateType extends object = any> {
  mode: PanelMode
  internalMode: InternalMode
  renderExtraFooter?: SharedPickerProps['renderExtraFooter']
  showNow: boolean
  generateConfig: GenerateConfig<DateType>
  disabledDate: DisabledDate<DateType>
  showTime?: PopupShowTimeConfig<DateType>

  // Invalid
  /** From Footer component used only. Check if can OK button click */
  invalid?: boolean

  // Submit
  onSubmit: (date?: DateType) => void
  needConfirm: boolean

  // Now
  onNow: (now: DateType) => void
}

export default defineComponent<FooterProps>({
  name: 'Footer',
  inheritAttrs: false,
  setup(props) {
    const {
      mode,
      internalMode,
      renderExtraFooter,
      showNow,
      showTime,
      onSubmit,
      onNow,
      invalid,
      needConfirm,
      generateConfig,
      disabledDate,
    } = toRefs(props)

    const pickerCtx = usePickerContext()

    // >>> Now
    const now = computed(() => generateConfig.value.getNow())

    const [getValidTime] = useTimeInfo(generateConfig, showTime, now)

    const nowDisabled = computed(() => disabledDate.value(now.value, {
      type: mode.value,
    }))

    const onInternalNow = () => {
      if (!nowDisabled.value) {
        const validateNow = getValidTime(now.value)
        onNow.value(validateNow)
      }
    }

    return () => {
      const { prefixCls, locale, button: Button = 'button', classNames, styles } = pickerCtx.value
      // ======================== Extra =========================
      const extraNode = renderExtraFooter.value?.(mode.value)
      // ======================== Ranges ========================
      const nowPrefixCls = `${prefixCls}-now`
      const nowBtnPrefixCls = `${nowPrefixCls}-btn`

      const presetNode = showNow.value && (
        <li class={nowPrefixCls}>
          <a
            class={clsx(nowBtnPrefixCls, nowDisabled.value && `${nowBtnPrefixCls}-disabled`)}
            aria-disabled={nowDisabled.value}
            onClick={onInternalNow}
          >
            {internalMode.value === 'date' ? locale.today : locale.now}
          </a>
        </li>
      )

      // >>> OK
      const okNode = needConfirm.value && (
        <li class={`${prefixCls}-ok`}>
          <Button disabled={invalid.value} onClick={onSubmit.value}>
            {locale.ok}
          </Button>
        </li>
      )

      const rangeNode = (presetNode || okNode) && (
        <ul class={`${prefixCls}-ranges`}>
          {presetNode}
          {okNode}
        </ul>
      )

      if (!extraNode && !rangeNode) {
        return null
      }

      return (
        <div
          class={clsx(`${prefixCls}-footer`, classNames.popup?.footer)}
          style={styles.popup?.footer}
        >
          {extraNode && <div class={`${prefixCls}-footer-extra`}>{extraNode}</div>}
          {rangeNode}
        </div>
      )
    }
  },
})
