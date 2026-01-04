import type { GenerateConfig } from '../../generate'
import type { SharedPanelProps } from '../../interface'
import { clsx } from '@v-c/util'
import { defineComponent } from 'vue'
import { isInRange, isSameWeek } from '../../utils/dateUtil'
import DatePanel from '../DatePanel'

const WeekPanel = defineComponent<SharedPanelProps<any>>(
  (props) => {
    return () => {
      const {
        prefixCls,
        generateConfig = {} as GenerateConfig<any>,
        locale = {} as any,
        value,
        hoverValue,
        hoverRangeValue,
      } = props
      const localeName = locale.locale
      const rowPrefixCls = `${prefixCls}-week-panel-row`

      const rowClassName = (currentDate: any) => {
        const rangeCls: Record<string, boolean> = {}

        if (hoverRangeValue) {
          const [rangeStart, rangeEnd] = hoverRangeValue
          const isRangeStart = isSameWeek(generateConfig, localeName, rangeStart, currentDate)
          const isRangeEnd = isSameWeek(generateConfig, localeName, rangeEnd, currentDate)

          rangeCls[`${rowPrefixCls}-range-start`] = isRangeStart
          rangeCls[`${rowPrefixCls}-range-end`] = isRangeEnd
          rangeCls[`${rowPrefixCls}-range-hover`]
            = !isRangeStart
              && !isRangeEnd
              && isInRange(generateConfig, rangeStart, rangeEnd, currentDate)
        }

        if (hoverValue) {
          rangeCls[`${rowPrefixCls}-hover`] = hoverValue.some((date: any) =>
            isSameWeek(generateConfig, localeName, currentDate, date),
          )
        }

        return clsx(
          rowPrefixCls,
          {
            [`${rowPrefixCls}-selected`]:
              !hoverRangeValue && isSameWeek(generateConfig, localeName, value, currentDate),
          },
          rangeCls,
        )
      }
      return (
        <DatePanel
          {...props}
          mode="week"
          panelName="week"
          rowClassName={rowClassName}
        />
      )
    }
  },
  {
    name: 'WeekPanel',
    inheritAttrs: false,
  },
)

export default WeekPanel
