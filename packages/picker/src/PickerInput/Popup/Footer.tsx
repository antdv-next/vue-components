import type { PopupShowTimeConfig } from '.'
import type { GenerateConfig } from '../../generate'
import type {
  DisabledDate,
  InternalMode,
  PanelMode,
  SharedPickerProps,
} from '../../interface'
import { clsx } from '@v-c/util'
import { computed, defineComponent } from 'vue'
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

const Footer = defineComponent<FooterProps>((rawProps, { attrs }) => {
  const props = new Proxy(rawProps as Record<string, any>, {
    get(target, key) {
      if (key in target) {
        return target[key as keyof typeof target]
      }
      return (attrs as Record<string, any>)[key as string]
    },
  }) as FooterProps
  const mode = computed(() => props.mode)
  const internalMode = computed(() => props.internalMode)
  const renderExtraFooter = computed(() => props.renderExtraFooter)
  const showNow = computed(() => props.showNow)
  const showTime = computed(() => props.showTime)
  const onSubmit = computed(() => props.onSubmit)
  const onNow = computed(() => props.onNow)
  const invalid = computed(() => props.invalid)
  const needConfirm = computed(() => props.needConfirm)
  const generateConfig = computed(() => props.generateConfig)
  const disabledDate = computed(() => props.disabledDate)

    const pickerCtx = usePickerContext()

    // >>> Now
    const now = computed(() => generateConfig.value.getNow())

    const [getValidTime] = useTimeInfo(generateConfig, showTime, now)

    const nowDisabled = computed(() =>
      disabledDate.value(now.value, {
        type: mode.value,
      }),
    )

    const onInternalNow = () => {
      if (!nowDisabled.value) {
        const validateNow = getValidTime(now.value)
        onNow.value(validateNow)
      }
    }

    return () => {
      const {
        prefixCls,
        locale,
        button: Button = 'button',
        classNames,
        styles,
      } = pickerCtx.value
      // ======================== Extra =========================
      const extraNode = renderExtraFooter.value?.(mode.value)
      // ======================== Ranges ========================
      const nowPrefixCls = `${prefixCls}-now`
      const nowBtnPrefixCls = `${nowPrefixCls}-btn`

      const presetNode = showNow.value && (
        <li class={nowPrefixCls}>
          <a
            class={clsx(
              nowBtnPrefixCls,
              nowDisabled.value && `${nowBtnPrefixCls}-disabled`,
            )}
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
          {extraNode && (
            <div class={`${prefixCls}-footer-extra`}>{extraNode}</div>
          )}
          {rangeNode}
        </div>
      )
    }
  }
})

Footer.name = 'Footer'
Footer.inheritAttrs = false

export default Footer
