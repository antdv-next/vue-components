import type { PropType } from 'vue'
import { clsx } from '@v-c/util'
import { defineComponent, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { usePanelContext } from '../../context'
import useScrollTo from './useScrollTo'

const SCROLL_DELAY = 300

export interface Unit<ValueType = number | string> {
  label: any
  value: ValueType
  disabled?: boolean
}

function flattenUnits(units: Unit<string | number>[]) {
  return units.map(({ value, label, disabled }) => [value, label, disabled].join(',')).join(';')
}

export default defineComponent({
  name: 'TimeColumn',
  props: {
    units: { type: Array as PropType<Unit[]>, required: true },
    value: { type: [Number, String] },
    optionalValue: { type: [Number, String] },
    type: { type: String as PropType<'hour' | 'minute' | 'second' | 'millisecond' | 'meridiem'>, required: true },
    onChange: { type: Function as PropType<(value: number | string) => void>, required: true },
    onHover: { type: Function as PropType<(value: number | string) => void>, required: true },
    onDblClick: { type: Function as PropType<() => void> },
    changeOnScroll: { type: Boolean },
  },
  setup(props) {
    const context = usePanelContext()
    const ulRef = ref<HTMLUListElement>()
    const checkDelayRef = ref<any>()

    const clearDelayCheck = () => {
      clearTimeout(checkDelayRef.value)
    }

    const [syncScroll, stopScroll, isScrolling] = useScrollTo(ulRef, () => props.value ?? props.optionalValue)

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

    return () => {
      const { units, value, type, onChange, onHover, onDblClick } = props
      const { prefixCls, cellRender, now, locale, classNames: panelClassNames, styles } = context!.value

      const panelPrefixCls = `${prefixCls}-time-panel`
      const cellPrefixCls = `${prefixCls}-time-panel-cell`
      const columnPrefixCls = `${panelPrefixCls}-column`

      return (
        <ul
          class={columnPrefixCls}
          ref={ulRef}
          data-type={type}
          onScroll={onInternalScroll}
        >
          {units.map(({ label, value: unitValue, disabled }) => {
            const inner = <div class={`${cellPrefixCls}-inner`}>{label}</div>

            return (
              <li
                key={unitValue}
                style={styles?.item}
                class={clsx(cellPrefixCls, panelClassNames!.item, {
                  [`${cellPrefixCls}-selected`]: value === unitValue,
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
})
