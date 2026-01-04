import type { SetupContext } from 'vue'
import { clsx } from '@v-c/util'
import { computed, defineComponent } from 'vue'
import { isSameOrAfter } from '../utils/dateUtil'
import { usePanelContext, usePickerHackContext } from './context'

const HIDDEN_STYLE: any = {
  visibility: 'hidden',
}

export interface PanelHeaderProps<DateType extends object = any> {
  offset?: (distance: number, date: DateType) => DateType
  superOffset?: (distance: number, date: DateType) => DateType
  onChange?: (date: DateType) => void
  getStart?: (date: DateType) => DateType
  getEnd?: (date: DateType) => DateType
}

const PanelHeader = defineComponent<PanelHeaderProps<any>>(
  (
    props,
    { slots }: SetupContext,
  ) => {
    const context = usePanelContext()!
    const pickerHackContext = usePickerHackContext()

    const disabledOffsetPrev = computed(() => {
      const { minDate, generateConfig, locale, pickerValue, panelType } = context.value
      const { offset, getEnd } = props

      if (!minDate || !offset || !getEnd) {
        return false
      }

      const prevPanelLimitDate = getEnd(offset(-1, pickerValue))

      return !isSameOrAfter(generateConfig!, locale!, prevPanelLimitDate, minDate, panelType)
    })

    const disabledSuperOffsetPrev = computed(() => {
      const { minDate, generateConfig, locale, pickerValue, panelType } = context.value
      const { superOffset, getEnd } = props

      if (!minDate || !superOffset || !getEnd) {
        return false
      }

      const prevPanelLimitDate = getEnd(superOffset(-1, pickerValue))

      return !isSameOrAfter(generateConfig!, locale!, prevPanelLimitDate, minDate, panelType)
    })

    const disabledOffsetNext = computed(() => {
      const { maxDate, generateConfig, locale, pickerValue, panelType } = context.value
      const { offset, getStart } = props

      if (!maxDate || !offset || !getStart) {
        return false
      }

      const nextPanelLimitDate = getStart(offset(1, pickerValue))

      return !isSameOrAfter(generateConfig!, locale!, maxDate, nextPanelLimitDate, panelType)
    })

    const disabledSuperOffsetNext = computed(() => {
      const { maxDate, generateConfig, locale, pickerValue, panelType } = context.value
      const { superOffset, getStart } = props

      if (!maxDate || !superOffset || !getStart) {
        return false
      }

      const nextPanelLimitDate = getStart(superOffset(1, pickerValue))

      return !isSameOrAfter(generateConfig!, locale!, maxDate, nextPanelLimitDate, panelType)
    })

    const onOffset = (distance: number) => {
      const { offset, onChange } = props
      const { pickerValue } = context.value
      if (offset && onChange) {
        onChange(offset(distance, pickerValue))
      }
    }

    const onSuperOffset = (distance: number) => {
      const { superOffset, onChange } = props
      const { pickerValue } = context.value
      if (superOffset && onChange) {
        onChange(superOffset(distance, pickerValue))
      }
    }

    return () => {
      const {
        prefixCls,
        classNames: panelClassNames,
        styles,
        prevIcon = '\u2039',
        nextIcon = '\u203A',
        superPrevIcon = '\u00AB',
        superNextIcon = '\u00BB',
        locale,
      } = context.value

      const { hidePrev, hideNext, hideHeader } = pickerHackContext?.value || {}
      const { offset, superOffset } = props

      if (hideHeader) {
        return null
      }

      const headerPrefixCls = `${prefixCls}-header`

      const prevBtnCls = `${headerPrefixCls}-prev-btn`
      const nextBtnCls = `${headerPrefixCls}-next-btn`
      const superPrevBtnCls = `${headerPrefixCls}-super-prev-btn`
      const superNextBtnCls = `${headerPrefixCls}-super-next-btn`

      return (
        <div class={clsx(headerPrefixCls, panelClassNames?.header)} style={styles?.header}>
          {superOffset && (
            <button
              type="button"
              aria-label={locale?.previousYear}
              onClick={() => onSuperOffset(-1)}
              tabindex={-1}
              class={clsx(
                superPrevBtnCls,
                disabledSuperOffsetPrev.value && `${superPrevBtnCls}-disabled`,
              )}
              disabled={disabledSuperOffsetPrev.value}
              style={hidePrev ? HIDDEN_STYLE : {}}
            >
              {superPrevIcon}
            </button>
          )}
          {offset && (
            <button
              type="button"
              aria-label={locale?.previousMonth}
              onClick={() => onOffset(-1)}
              tabindex={-1}
              class={clsx(prevBtnCls, disabledOffsetPrev.value && `${prevBtnCls}-disabled`)}
              disabled={disabledOffsetPrev.value}
              style={hidePrev ? HIDDEN_STYLE : {}}
            >
              {prevIcon}
            </button>
          )}
          <div class={`${headerPrefixCls}-view`}>{slots.default?.()}</div>
          {offset && (
            <button
              type="button"
              aria-label={locale?.nextMonth}
              onClick={() => onOffset(1)}
              tabindex={-1}
              class={clsx(nextBtnCls, disabledOffsetNext.value && `${nextBtnCls}-disabled`)}
              disabled={disabledOffsetNext.value}
              style={hideNext ? HIDDEN_STYLE : {}}
            >
              {nextIcon}
            </button>
          )}
          {superOffset && (
            <button
              type="button"
              aria-label={locale?.nextYear}
              onClick={() => onSuperOffset(1)}
              tabindex={-1}
              class={clsx(
                superNextBtnCls,
                disabledSuperOffsetNext.value && `${superNextBtnCls}-disabled`,
              )}
              disabled={disabledSuperOffsetNext.value}
              style={hideNext ? HIDDEN_STYLE : {}}
            >
              {superNextIcon}
            </button>
          )}
        </div>
      )
    }
  },
  {
    name: 'PanelHeader',
  },
)

export default PanelHeader
