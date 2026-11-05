import type { PopupShowTimeConfig } from '.'
import type { GenerateConfig } from '../../generate'
import type {
  DisabledDate,
  InternalMode,
  PanelMode,
  SharedPickerProps,
} from '../../interface'
import { clsx, isVueRenderable } from '@v-c/util'
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

/**
 * `type` is a native `button` attribute. Custom components (e.g. antdv-next Button) use `type`
 * as their own variant prop, so only pass it when the intrinsic element is rendered.
 */
function getNativeTypeProps(Component: unknown) {
  return Component === 'button' ? ({ type: 'button' } as const) : null
}

const Footer = defineComponent<FooterProps>((props) => {
  const mode = computed(() => props.mode)
  const internalMode = computed(() => props.internalMode)
  const renderExtraFooter = computed(() => props.renderExtraFooter)
  const showNow = computed(() => props.showNow)
  const showTime = computed(() => props.showTime)
  const onSubmit = computed(() => props.onSubmit)
  const onNow = computed(() => props.onNow)
  const invalid = computed(() => props.invalid)
  const needConfirm = computed(() => props.needConfirm)

  const pickerCtx = usePickerContext()

  const generateConfig = computed(() => props.generateConfig || pickerCtx.value.generateConfig)
  const disabledDate = computed(() => props.disabledDate)

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
      button = 'button',
      nowButton,
      okButton,
      classNames,
      styles,
    } = pickerCtx.value
    // ======================== Extra =========================
    const extraNode = renderExtraFooter.value?.(mode.value)
    // ======================== Ranges ========================
    const NowButton: any = nowButton || 'button'
    const OkButton: any = okButton || button

    const presetNode = showNow.value && (
      <NowButton
        {...getNativeTypeProps(NowButton)}
        class={`${prefixCls}-now`}
        disabled={nowDisabled.value}
        onClick={onInternalNow}
      >
        {internalMode.value === 'date' ? locale.today : locale.now}
      </NowButton>
    )

    // >>> OK
    const okNode = needConfirm.value && (
      <OkButton
        {...getNativeTypeProps(OkButton)}
        disabled={invalid.value}
        class={`${prefixCls}-ok`}
        onClick={onSubmit.value}
      >
        {locale.ok}
      </OkButton>
    )

    const rangeNode = (presetNode || okNode) && (
      <div class={`${prefixCls}-ranges`}>
        {presetNode}
        {okNode}
      </div>
    )

    if (!isVueRenderable(extraNode) && !isVueRenderable(rangeNode)) {
      return null
    }

    return (
      <div
        class={clsx(`${prefixCls}-footer`, classNames.popup?.footer)}
        style={styles.popup?.footer}
      >
        {isVueRenderable(extraNode) && (
          <div class={`${prefixCls}-footer-extra`}>{extraNode}</div>
        )}
        {rangeNode}
      </div>
    )
  }
}, {
  name: 'Footer',
  inheritAttrs: false,
})

export default Footer
