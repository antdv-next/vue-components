import type { Locale } from '../../../interface'
import { clsx } from '@v-c/util'
import { computed, defineComponent, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { usePanelContext } from '../../context'
import useScrollTo from './useScrollTo'

const SCROLL_DELAY = 300

export interface Unit<ValueType = number | string> {
  label: any
  value: ValueType
  disabled?: boolean
}

type TimeUnitType = 'hour' | 'minute' | 'second' | 'millisecond' | 'meridiem'

function flattenUnits(units: Unit<string | number>[]) {
  return units.map(({ value, label, disabled }) => [value, label, disabled].join(',')).join(';')
}

const LIST_LABEL_MAP: Record<TimeUnitType, (locale: Locale) => string | undefined> = {
  hour: locale => locale.hourSelect,
  minute: locale => locale.minuteSelect,
  second: locale => locale.secondSelect,
  millisecond: locale => locale.millisecondSelect,
  meridiem: locale => locale.meridiemSelect,
}

// `en_US` → `en-US`, `sr_Cyrl_RS` → `sr-Cyrl-RS`
const toBCP47 = (code: string) => code.replace(/_/g, '-')

const LIST_ITEM_LABEL_MAP: Record<
  TimeUnitType,
  (value: string | number, locale: Locale) => string
> = {
  hour: (value, locale) =>
    value.toLocaleString(toBCP47(locale.locale), {
      style: 'unit',
      unit: 'hour',
      unitDisplay: 'long',
    }),
  minute: (value, locale) =>
    value.toLocaleString(toBCP47(locale.locale), {
      style: 'unit',
      unit: 'minute',
      unitDisplay: 'long',
    }),
  second: (value, locale) =>
    value.toLocaleString(toBCP47(locale.locale), {
      style: 'unit',
      unit: 'second',
      unitDisplay: 'long',
    }),
  millisecond: (value, locale) =>
    value.toLocaleString(toBCP47(locale.locale), {
      style: 'unit',
      unit: 'millisecond',
      unitDisplay: 'long',
    }),
  meridiem: value => value.toString(),
}

export interface TimeColumnProps {
  units: Unit[]
  value?: number | string
  optionalValue?: number | string
  type: TimeUnitType
  onChange: (value: number | string) => void
  onHover: (value: number | string) => void
  onDblClick?: VoidFunction
  changeOnScroll?: boolean
}

const TimeColumn = defineComponent<TimeColumnProps>(
  (props) => {
    const context = usePanelContext()
    const ulRef = ref<HTMLUListElement>()
    const checkDelayRef = ref<any>()

    const clearDelayCheck = () => {
      clearTimeout(checkDelayRef.value)
    }

    const [syncScroll, stopScroll, isScrolling] = useScrollTo(ulRef, computed(() => props.value ?? props.optionalValue))

    watch(
      [() => props.value, () => props.optionalValue, () => flattenUnits(props.units)],
      () => {
        syncScroll()
        clearDelayCheck()
      },
      { flush: 'post' },
    )

    onMounted(() => {
      syncScroll()
    })

    onBeforeUnmount(() => {
      stopScroll()
      clearDelayCheck()
    })

    const onInternalScroll = (event: Event) => {
      clearDelayCheck()
      const target = event.target as HTMLUListElement

      if (!isScrolling() && props.changeOnScroll) {
        checkDelayRef.value = setTimeout(() => {
          const ul = ulRef.value!
          const firstLi = ul.querySelector(`li`) as HTMLLIElement
          const firstLiTop = firstLi.offsetTop
          const liList = Array.from(ul.querySelectorAll(`li`)) as HTMLLIElement[]
          const liTopList = liList.map(li => li.offsetTop - firstLiTop)
          const liDistList = liTopList.map((top, index) => {
            if (props.units[index].disabled) {
              return Number.MAX_SAFE_INTEGER
            }
            return Math.abs(top - target.scrollTop)
          })

          const minDist = Math.min(...liDistList)
          const minDistIndex = liDistList.findIndex(dist => dist === minDist)
          const targetUnit = props.units[minDistIndex]
          if (targetUnit && !targetUnit.disabled) {
            props.onChange(targetUnit.value)
          }
        }, SCROLL_DELAY)
      }
    }

    // ========================= Focus =========================
    // Tracks keyboard-navigation cursor separately from the committed value.
    const focusedValue = shallowRef<number | string | null>(null)

    // Reset cursor when the committed value changes (e.g. click or external update).
    watch(() => props.value, () => {
      focusedValue.value = null
    })

    const tabFocusValue = computed(() => focusedValue.value ?? props.value ?? props.optionalValue)

    // After keyboard navigation, move DOM focus to the new cursor cell.
    let pendingFocus = false
    watch(focusedValue, (nextValue) => {
      if (pendingFocus) {
        pendingFocus = false
        const index = props.units.findIndex(unit => unit.value === nextValue)
        ;(ulRef.value?.children[index] as HTMLElement | undefined)?.focus()
      }
    }, { flush: 'post' })

    // ========================= Keyboard =========================
    const onCellKeyDown = (e: KeyboardEvent) => {
      const enabledUnits = props.units.filter(u => !u.disabled)
      const currentIdx = enabledUnits.findIndex(u => u.value === tabFocusValue.value)

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        pendingFocus = true
        const next = currentIdx < enabledUnits.length - 1 ? currentIdx + 1 : 0
        focusedValue.value = enabledUnits[next]?.value ?? null
      }
      else if (e.key === 'ArrowUp') {
        e.preventDefault()
        pendingFocus = true
        const prev = currentIdx > 0 ? currentIdx - 1 : enabledUnits.length - 1
        focusedValue.value = enabledUnits[prev]?.value ?? null
      }
      else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        const target = enabledUnits.find(u => u.value === tabFocusValue.value)
        if (target) {
          props.onChange(target.value)
        }
      }
    }

    return () => {
      const { units, value, type, onChange, onHover, onDblClick } = props
      const { prefixCls, cellRender, now, locale, classNames: panelClassNames, styles } = context!.value

      const panelPrefixCls = `${prefixCls}-time-panel`
      const cellPrefixCls = `${prefixCls}-time-panel-cell`
      const columnPrefixCls = `${panelPrefixCls}-column`

      return (
        <ul
          role="listbox"
          aria-label={locale ? LIST_LABEL_MAP[type](locale) : undefined}
          class={columnPrefixCls}
          ref={ulRef}
          data-type={type}
          onScroll={onInternalScroll}
          // React's `onBlur` bubbles; `focusout` is the Vue equivalent
          onFocusout={(e: FocusEvent) => {
            if (!ulRef.value?.contains(e.relatedTarget as Node)) {
              focusedValue.value = null
            }
          }}
        >
          {units.map(({ label, value: unitValue, disabled }) => {
            const inner = <div class={`${cellPrefixCls}-inner`}>{label}</div>
            const isSelected = value === unitValue

            return (
              <li
                key={unitValue}
                aria-label={locale ? LIST_ITEM_LABEL_MAP[type](unitValue, locale) : undefined}
                tabindex={tabFocusValue.value === unitValue ? 0 : -1}
                role="option"
                aria-selected={isSelected}
                aria-disabled={disabled}
                style={styles?.item}
                class={clsx(cellPrefixCls, panelClassNames?.item, {
                  [`${cellPrefixCls}-selected`]: isSelected,
                  [`${cellPrefixCls}-disabled`]: disabled,
                })}
                onClick={() => {
                  if (!disabled) {
                    onChange(unitValue)
                  }
                }}
                onDblclick={() => {
                  if (!disabled && onDblClick) {
                    onDblClick()
                  }
                }}
                onMouseenter={() => {
                  onHover(unitValue)
                }}
                onMouseleave={() => {
                  onHover(null!)
                }}
                onKeydown={onCellKeyDown}
                data-value={unitValue}
              >
                {cellRender
                  ? cellRender(unitValue, {
                      prefixCls,
                      originNode: inner,
                      today: now,
                      type: 'time',
                      subType: type,
                      locale,
                    })
                  : inner}
              </li>
            )
          })}
        </ul>
      )
    }
  },
  {
    name: 'TimeColumn',
  },
)

export default TimeColumn
